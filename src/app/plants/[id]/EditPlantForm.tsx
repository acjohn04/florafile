"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/ImageUploader";
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

export function EditPlantForm({ plant }: EditPlantFormProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [nickname, setNickname] = useState(plant.nickname);
  const [room, setRoom] = useState(plant.room);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagnosis state — initialized from existing plant data, updated after save
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(parseDiagnosis(plant));
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleImageSelect = (base64: string, mime: string) => {
    setImageBase64(base64);
    setMimeType(mime);
    setIsEditingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Show diagnosing state if a new image is being uploaded
    if (imageBase64) {
      setIsDiagnosing(true);
    }

    try {
      const payload = {
        nickname,
        room,
        ...(imageBase64 && { imageData: `data:${mimeType};base64,${imageBase64}` })
      };

      const res = await fetch(`/api/plants/${plant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(t.plantDetail.failedSave);
      }

      // Parse diagnosis from the updated plant response
      const updatedPlant = await res.json();
      const newDiagnosis = parseDiagnosis(updatedPlant);
      setDiagnosis(newDiagnosis);
      setIsDiagnosing(false);

      // If no new image was uploaded, navigate back to dashboard
      if (!imageBase64) {
        router.push("/");
        router.refresh();
      } else {
        // Stay on page to show diagnosis results, then allow user to navigate
        setIsSaving(false);
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
  };

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

      {/* Image section */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-on-surface-variant">Photo</span>
        {!isEditingImage && (plant.imageUrl || imageBase64) ? (
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-surface-container border border-surface-container-high group">
            <Image
              src={imageBase64 ? `data:${mimeType};base64,${imageBase64}` : plant.imageUrl!}
              alt={nickname || plant.commonName}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsEditingImage(true)}
                className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-white font-medium cursor-pointer"
              >
                <Icon name="edit" /> Edit Photo
              </button>
            </div>
          </div>
        ) : (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}
      </div>

      {/* Diagnosis card — shown when plant has an active diagnosis */}
      {isDiagnosing && (
        <div className="bg-surface-container-low border border-surface-container p-6 rounded-3xl flex items-center justify-center gap-3">
          <Icon name="progress_activity" className="animate-spin text-primary" />
          <span className="text-on-surface-variant font-medium">{t.plantDetail.diagnosing}</span>
        </div>
      )}

      {!isDiagnosing && diagnosis && (
        <DiagnosisCard diagnosis={diagnosis} />
      )}

      {!isDiagnosing && !diagnosis && plant.status === "healthy" && plant.imageUrl && (
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
            {Object.entries(t.confirm.rooms).map(([key, label]) => (
              <option key={key} value={label}>
                {label}
              </option>
            ))}
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
