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
}

interface EditPlantFormProps {
  plant: PlantData;
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

  const handleImageSelect = (base64: string, mime: string) => {
    setImageBase64(base64);
    setMimeType(mime);
    setIsEditingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

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

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.plantDetail.failedSave);
      }
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-3xl font-heading font-bold text-on-surface">
          {t.plantDetail.editTitle}
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-on-surface-variant">Photo</span>
        {!isEditingImage && (plant.imageUrl || imageBase64) ? (
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-surface-container border border-surface-container-high group">
            <Image
              src={imageBase64 ? `data:${mimeType};base64,${imageBase64}` : plant.imageUrl!}
              alt={nickname || plant.commonName}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsEditingImage(true)}
                className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-white font-medium"
              >
                <Icon name="edit" /> Edit Photo
              </button>
            </div>
          </div>
        ) : (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}
      </div>

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
            className="px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary outline-none transition-shadow text-on-surface appearance-none"
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
        className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ambient"
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
