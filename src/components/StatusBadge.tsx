import { Icon } from "./Icon";

export function StatusBadge({ status }: { status: string }) {
  let config = { bg: "bg-surface-container", text: "text-on-surface", icon: "help", label: status };

  if (status === "healthy") {
    config = { bg: "bg-primary-container", text: "text-on-primary-container", icon: "check_circle", label: "Healthy" };
  } else if (status === "needs_water") {
    config = { bg: "bg-tertiary-container", text: "text-on-tertiary-container", icon: "water_drop", label: "Needs Water" };
  } else if (status === "prune_soon") {
    config = { bg: "bg-secondary-container", text: "text-on-secondary-container", icon: "content_cut", label: "Prune Soon" };
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon name={config.icon} className="text-[14px]" filled />
      {config.label}
    </div>
  );
}
