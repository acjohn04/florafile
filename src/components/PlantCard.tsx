"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { useRouter } from "next/navigation";

interface PlantCardProps {
  plant: {
    id: string;
    nickname: string;
    commonName: string;
    scientificName: string;
    room: string;
    status: string;
    imageUrl: string | null;
  };
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this plant?")) {
      try {
        await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
        router.refresh();
      } catch (err) {
        console.error("Failed to delete plant:", err);
      }
    }
  };

  return (
    <Link href={`/plants/${plant.id}`} className="block group">
      <div className="relative bg-surface-container-low rounded-2xl overflow-hidden shadow-ambient hover:shadow-ambient-hover transition-all duration-300 border border-surface-container">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
          {plant.imageUrl ? (
            <Image
              src={plant.imageUrl}
              alt={plant.nickname}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-surface-container-highest">
              <Icon name="local_florist" className="text-6xl" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <StatusBadge status={plant.status} />
          </div>
        </div>
        <div className="p-4 flex justify-between items-end gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-lg text-on-surface truncate">{plant.nickname || plant.commonName}</h3>
            <p className="text-on-surface-variant text-sm italic truncate mb-2">{plant.commonName}({plant.scientificName})</p>

            <div className="flex items-center gap-1 text-on-surface-variant text-xs font-medium">
              <Icon name="location_on" className="text-[16px]" />
              <span className="truncate max-w-[100px]">{plant.room}</span>
            </div>

            {/* Sun Icon: Indicates light requirements or tracking (e.g., "Needs more light" or "Light exposure tracked").
Waves Icon: Represents humidity or misting status.
Water Drop / Calendar Icon: Tracks watering schedules or upcoming soil moisture checks.
These icons provide a high-level summary of each plant's health and immediate needs without requiring you to open a detailed view, making it easy to manage a large collection at a glance. */}
          </div>
          <button
            onClick={handleDelete}
            className="p-1 -mr-1 -mb-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer shrink-0 z-10"
            aria-label="Delete plant"
          >
            <Icon name="delete" className="text-xl" />
          </button>
        </div>
      </div>
    </Link>
  );
}
