"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";

export default function DoctorPage() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (base64: string, mimeType: string, file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/doctor", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t.doctor.failedError);
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error-container text-on-error-container rounded-full mb-4">
          <Icon name="medical_services" className="text-3xl" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-on-surface">{t.doctor.title}</h1>
        <p className="text-on-surface-variant mt-2">{t.doctor.subtitle}</p>
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
          <div className="bg-surface-container-low border border-surface-container p-6 rounded-3xl">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-surface-container">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                ${result.severity === 'high' ? 'bg-error text-on-error' : 
                  result.severity === 'medium' ? 'bg-secondary text-on-secondary' : 
                  'bg-surface-container-highest text-on-surface'}
              `}>
                <Icon name="warning" className="text-2xl" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
                  {t.doctor.severity}: {result.severity}
                </div>
                <h2 className="text-2xl font-heading font-bold text-on-surface">{result.diagnosisName}</h2>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                <Icon name="info" className="text-primary" /> {t.doctor.whatsHappening}
              </h3>
              <p className="text-on-surface-variant leading-relaxed">{result.description}</p>
            </div>

            <div>
              <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                <Icon name="healing" className="text-primary" /> {t.doctor.recoveryPlan}
              </h3>
              <ol className="space-y-3">
                {result.recoverySteps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 bg-surface-container-lowest p-3 rounded-xl border border-surface-container">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-on-surface">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
