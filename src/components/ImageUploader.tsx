"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { useTranslation } from "@/i18n/client";

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string, file: File) => void;
  isProcessing?: boolean;
}

export function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

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
        setPreview(dataUrl);
        
        const base64 = dataUrl.split(",")[1];
        canvas.toBlob((blob) => {
          if (blob) {
            const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const resizedFile = new File([blob], newFilename, { type: mimeType });
            onImageSelect(base64, mimeType, resizedFile);
          }
        }, mimeType, 0.8);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group
        ${dragActive ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-lowest hover:border-primary/50"}
        ${isProcessing ? "pointer-events-none" : ""}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-white">
              <Icon name="cameraswitch" /> {t.components.imageUploader.retakePhoto}
            </div>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 z-10">
              <div className="scan-line" />
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center">
                <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 text-primary animate-pulse">
                  <Icon name="search" /> {t.components.imageUploader.analyzing}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Icon name="add_a_photo" className="text-3xl" />
          </div>
          <div>
            <p className="text-on-surface font-medium text-lg">{t.components.imageUploader.tapToSnap}</p>
            <p className="text-on-surface-variant text-sm mt-1">{t.components.imageUploader.makeSureLeavesVisible}</p>
          </div>
        </div>
      )}
    </div>
  );
}
