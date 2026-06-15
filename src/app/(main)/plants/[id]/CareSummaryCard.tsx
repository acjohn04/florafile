"use client";

import { Icon } from "@/components/Icon";
import { CareSummaryGrid } from "@/components/CareSummaryGrid";
import { useTranslation } from "@/i18n/client";

interface CareSummaryCardProps {
  light: string;
  water: string;
  toxicity: string;
  careLevel: string;
  scientificName: string;
  description: string | null;
}

/**
 * Standalone care summary card for the plant detail right column.
 * Shows the scientific name, description, and the 2×2 care grid
 * (light, water, toxicity, care level) populated during identification.
 */
export function CareSummaryCard({
  light,
  water,
  toxicity,
  careLevel,
  scientificName,
  description,
}: CareSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon name="eco" className="text-primary" />
        <h2 className="font-bold text-on-surface">{t.plantDetail.careSummaryTitle}</h2>
      </div>

      {scientificName && (
        <p className="text-sm italic text-on-surface-variant mb-1">{scientificName}</p>
      )}
      {description && (
        <p className="text-sm text-on-surface-variant mb-1 leading-relaxed">{description}</p>
      )}

      <CareSummaryGrid
        light={light}
        water={water}
        toxicity={toxicity}
        careLevel={careLevel}
      />
    </div>
  );
}
