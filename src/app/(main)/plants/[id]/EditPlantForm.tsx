"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";
import Image from "next/image";

interface PlantData {
  id: string;
  nickname: string;
  room: string;
  imageUrl: string | null;
  commonName: string;
  status: string;
  diagnosisName: string | null;
  severity: string | null;
  diagnosisDescription: string | null;
  recoverySteps: string | null; // JSON array stored as text
}

interface DiagnosisData {
  diagnosisName: string;
  severity: string;
  description: string;
  recoverySteps: string[];
}

interface EditPlantFormProps {
  plant: PlantData;
}

/**
 * Parse diagnosis data from either the API response (plant record) or initial props.
 * Returns null if plant is healthy (no diagnosis).
 */
function parseDiagnosis(plant: {
  status: string;
  diagnosisName: string | null;
  severity: string | null;
  diagnosisDescription: string | null;
  recoverySteps: string | null;
}): DiagnosisData | null {
  if (plant.status !== "sick" || !plant.diagnosisName) return null;

  let steps: string[] = [];
  if (plant.recoverySteps) {
    try {
      steps = JSON.parse(plant.recoverySteps);
    } catch {
      steps = [];
    }
  }

  return {
    diagnosisName: plant.diagnosisName,
    severity: plant.severity || "low",
    description: plant.diagnosisDescription || "",
    recoverySteps: steps,
  };
}

/**
 * Read a File into a resized WebP base64 string + blob, matching ImageUploader logic.
 * Returns { base64, mimeType } or null if the file isn't an image.
 */
function resizeImageFile(file: File): Promise<{ base64: string; mimeType: string } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = document.createElement("img");
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const mimeType = "image/webp";
        const dataUrl = canvas.toDataURL(mimeType, 0.8);
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export function EditPlantForm({ plant }: EditPlantFormProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Hidden file input ref — clicking the image directly opens the file picker
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(plant.nickname);
  const [room, setRoom] = useState(plant.room);

  // Tracks the *persisted* image URL returned by the server after a successful save.
  // Falls back to the initial prop value until the user uploads a new image.
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(plant.imageUrl);
  // Tracks the current plant status (updated after save with diagnosis)
  const [currentStatus, setCurrentStatus] = useState(plant.status);

  // Preview data URL shown immediately after selecting a file, before the server responds
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => {
        setLocations(data);
      })
      .catch(console.error);
  }, []);

  // Diagnosis state — initialized from existing plant data, updated after save
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(parseDiagnosis(plant));
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  /**
   * Sends a PATCH to save the plant. When `imagePayload` is provided, it includes
   * the base64 image data so the server can upload, run diagnosis, and snapshot history.
   * After a successful save, refreshes the server component cache so navigation
   * (dashboard, back button) always shows the latest data.
   */
  const savePlant = useCallback(async (imagePayload?: { base64: string; mimeType: string }) => {
    setIsSaving(true);
    setError(null);

    if (imagePayload) {
      setIsDiagnosing(true);
    }

    try {
      const payload = {
        nickname,
        room,
        ...(imagePayload && {
          imageData: `data:${imagePayload.mimeType};base64,${imagePayload.base64}`,
        }),
      };

      const res = await fetch(`/api/plants/${plant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(t.plantDetail.failedSave);
      }

      const updatedPlant = await res.json();

      // Update local state with the server-persisted values so the UI is in sync
      setCurrentImageUrl(updatedPlant.imageUrl);
      setCurrentStatus(updatedPlant.status);
      setPreviewDataUrl(null); // clear preview; use the persisted URL now

      const newDiagnosis = parseDiagnosis(updatedPlant);
      setDiagnosis(newDiagnosis);
      setIsDiagnosing(false);
      setIsSaving(false);

      // Refresh server component cache so dashboard/navigation shows the new data
      router.refresh();

      // Signal the PlantHistoryTimeline to refetch (new history entry was created)
      if (imagePayload) {
        window.dispatchEvent(new CustomEvent("plant-history-updated"));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.plantDetail.failedSave);
      }
      setIsSaving(false);
      setIsDiagnosing(false);
    }
  }, [nickname, room, plant.id, router, t.plantDetail.failedSave]);

  /**
   * Handles file selection from the hidden input.
   * Resizes the image, shows an instant preview, then auto-saves via PATCH.
   */
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so re-selecting the same file still triggers onChange
    e.target.value = "";

    const result = await resizeImageFile(file);
    if (!result) return;

    // Show instant preview while the save + diagnosis runs
    setPreviewDataUrl(`data:${result.mimeType};base64,${result.base64}`);

    // Auto-save the new image (uploads, runs AI diagnosis, snapshots history)
    await savePlant({ base64: result.base64, mimeType: result.mimeType });
  }, [savePlant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The save button only saves text fields (nickname, room).
    // Images are auto-saved on selection via handleFileChange.
    await savePlant();

    // Navigate back to dashboard after saving text-only changes
    router.push("/");
  };

  /**
   * The image to display: preview (while saving) → persisted URL → nothing.
   * This ensures the UI always shows the most up-to-date image.
   */
  const displayImageSrc = previewDataUrl || currentImageUrl;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-3xl font-heading font-bold text-on-surface">
          {t.plantDetail.editTitle}
        </h1>
      </div>

      {/* Hidden file input — shared by both the existing-image overlay and the empty-state uploader */}
      {/* 
        Including 'application/pdf' alongside 'image/*' is a workaround for modern Android devices.
        Using just 'image/*' forces Chrome on Android to only show the photo gallery, hiding the Camera option.
        Adding 'application/pdf' broadens the filter enough to trigger the system's full file picker, 
        which restores the Camera and Files options. Non-image files are safely ignored by resizeImageFile.
      */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />

      {/* Image section — single click opens the file picker directly */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-on-surface-variant">Photo</span>
        {displayImageSrc ? (
          <div
            className={`relative aspect-square w-full rounded-3xl overflow-hidden bg-surface-container border border-surface-container-high group cursor-pointer ${
              isSaving ? "pointer-events-none" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={displayImageSrc}
              alt={nickname || plant.commonName}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
            {/* Hover overlay with "Change Photo" prompt */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-white font-medium">
                <Icon name="cameraswitch" /> Change Photo
              </div>
            </div>
            {/* Diagnosing / uploading overlay */}
            {isDiagnosing && (
              <div className="absolute inset-0 z-10">
                <div className="scan-line" />
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 text-primary animate-pulse">
                    <Icon name="search" /> {t.plantDetail.diagnosing}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No image yet — show the empty-state upload prompt */
          <div
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group border-outline-variant bg-surface-container-lowest hover:border-primary/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon name="add_a_photo" className="text-3xl" />
              </div>
              <div>
                <p className="text-on-surface font-medium text-lg">{t.components.imageUploader.tapToSnap}</p>
                <p className="text-on-surface-variant text-sm mt-1">{t.components.imageUploader.makeSureLeavesVisible}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnosis card — shown after AI analysis completes */}
      {!isDiagnosing && diagnosis && (
        <DiagnosisCard diagnosis={diagnosis} />
      )}

      {!isDiagnosing && !diagnosis && currentStatus === "healthy" && currentImageUrl && (
        <div className="bg-primary-container/30 border border-primary-container p-4 rounded-2xl flex items-center gap-3">
          <Icon name="check_circle" className="text-primary text-xl" filled />
          <span className="text-on-surface text-sm font-medium">{t.plantDetail.healthyStatus}</span>
        </div>
      )}

      {/* Form fields */}
      <div className="flex flex-col gap-4 bg-surface-container-low p-6 rounded-3xl border border-surface-container">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-on-surface-variant">
            {t.plantDetail.nicknameLabel}
          </span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none transition-shadow text-on-surface placeholder:text-on-surface-variant/50"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-on-surface-variant">
            {t.plantDetail.locationLabel}
          </span>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none transition-shadow text-on-surface appearance-none cursor-pointer"
            required
          >
            {(() => {
              const options = locations.map(l => l.name);
              if (room && !options.includes(room)) {
                options.push(room);
              }
              return options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ));
            })()}
          </select>
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 text-error flex items-center gap-3">
          <Icon name="error" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ambient cursor-pointer"
      >
        {isSaving ? (
          <>
            <Icon name="progress_activity" className="animate-spin" />
            {t.plantDetail.savingButton}
          </>
        ) : (
          <>
            <Icon name="save" />
            {t.plantDetail.saveButton}
          </>
        )}
      </button>
    </form>
  );
}

/**
 * Inline diagnosis results card — replaces what used to be on the Doctor page.
 * Shows severity, diagnosis name, description, and numbered recovery steps.
 */
function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosisData }) {
  const { t } = useTranslation();

  const severityColor =
    diagnosis.severity === "high"
      ? "bg-error text-on-error"
      : diagnosis.severity === "medium"
      ? "bg-secondary text-on-secondary"
      : "bg-surface-container-highest text-on-surface";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface-container-low border border-surface-container p-6 rounded-3xl">
        {/* Header: severity + diagnosis name */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-surface-container">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${severityColor}`}>
            <Icon name="warning" className="text-2xl" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
              {t.plantDetail.severity}: {diagnosis.severity}
            </div>
            <h2 className="text-2xl font-heading font-bold text-on-surface">{diagnosis.diagnosisName}</h2>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
            <Icon name="info" className="text-primary" /> {t.plantDetail.whatsHappening}
          </h3>
          <p className="text-on-surface-variant leading-relaxed">{diagnosis.description}</p>
        </div>

        {/* Recovery steps */}
        {diagnosis.recoverySteps.length > 0 && (
          <div>
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <Icon name="healing" className="text-primary" /> {t.plantDetail.recoveryPlan}
            </h3>
            <ol className="space-y-3">
              {diagnosis.recoverySteps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3 bg-surface-container-lowest p-3 rounded-xl border border-surface-container">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-on-surface">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
