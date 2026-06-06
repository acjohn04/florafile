"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { CareSummaryGrid } from "@/components/CareSummaryGrid";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";
import type { PlantData } from "@/types";

export default function IdentifyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PlantData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleImageSelect = async (base64: string, mimeType: string, file: File) => {
    setIsProcessing(true);
    setError(null);
    setCapturedImage(`data:${mimeType};base64,${base64}`);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t.identify.failedError);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGarden = () => {
    if (!result) return;

    sessionStorage.setItem("florafile_new_plant", JSON.stringify(result));
    if (capturedImage) {
      sessionStorage.setItem("florafile_new_image", capturedImage);
    }

    router.push("/confirm");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-on-surface">{t.identify.title}</h1>
        <p className="text-on-surface-variant mt-2">{t.identify.subtitle}</p>
      </header>

      <ImageUploader onImageSelect={handleImageSelect} isProcessing={isProcessing} />

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-2xl flex items-center gap-3">
          <Icon name="error" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                <Icon name="psychology" className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-on-surface">{result.commonName}</h2>
                <p className="text-on-surface-variant italic">{result.scientificName}</p>
              </div>
            </div>

            <p className="mt-4 text-on-surface">{result.description}</p>

            <CareSummaryGrid
              light={result.light}
              water={result.water}
              toxicity={result.toxicity}
              careLevel={result.careLevel}
            />

            <button
              onClick={handleSaveToGarden}
              className="w-full mt-6 bg-primary text-on-primary font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors"
            >
              <Icon name="add" /> {t.identify.addToGarden}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
