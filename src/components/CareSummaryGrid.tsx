import { Icon } from "./Icon";
import { useTranslation } from "@/i18n/client";

interface CareSummaryGridProps {
  light: string;
  water: string;
  toxicity: string;
  careLevel: string;
}

export function CareSummaryGrid({ light, water, toxicity, careLevel }: CareSummaryGridProps) {
  const { t } = useTranslation();
  
  const items = [
    { icon: "light_mode", label: t.components.careSummaryGrid.light, value: light, color: "text-primary-fixed-dim" },
    { icon: "water_drop", label: t.components.careSummaryGrid.water, value: water, color: "text-secondary-fixed-dim" },
    { icon: "pets", label: t.components.careSummaryGrid.toxicity, value: toxicity, color: "text-error" },
    { icon: "psychology", label: t.components.careSummaryGrid.careLevel, value: careLevel, color: "text-tertiary-fixed-dim" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-6">
      {items.map((item, idx) => (
        <div key={idx} className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon name={item.icon} className={item.color} />
            <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">{item.label}</span>
          </div>
          <span className="text-on-surface text-sm font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
