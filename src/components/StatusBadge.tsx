import { Icon } from "./Icon";
import { useTranslation } from "@/i18n/client";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  let config = { bg: "bg-surface-container", text: "text-on-surface", icon: "help", label: status };

  if (status === "healthy") {
    config = { bg: "bg-primary-container", text: "text-on-primary-container", icon: "check_circle", label: t.components.statusBadge.healthy };
  } else if (status === "sick") {
    config = { bg: "bg-error-container", text: "text-on-error-container", icon: "medical_services", label: t.components.statusBadge.sick };
  } else if (status === "needs_water") {
    config = { bg: "bg-tertiary-container", text: "text-on-tertiary-container", icon: "water_drop", label: t.components.statusBadge.needsWater };
  } else if (status === "prune_soon") {
    config = { bg: "bg-secondary-container", text: "text-on-secondary-container", icon: "content_cut", label: t.components.statusBadge.pruneSoon };
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon name={config.icon} className="text-[14px]" filled />
      {config.label}
    </div>
  );
}
