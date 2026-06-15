"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

interface PlantHistoryTimelineProps {
  plantId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a date into a human-readable relative string (e.g. "3 days ago")
 * or a formatted date for older entries.
 */
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  // For older entries, show the formatted date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ─── Status Dot Component ────────────────────────────────────────────────────

/** Small colored dot indicating health status. */
function StatusDot({ status }: { status: string }) {
  const isSick = status === "sick";

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
        isSick ? "bg-error" : "bg-primary"
      }`}
      title={isSick ? "Sick" : "Healthy"}
    />
  );
}

// ─── Lightbox Component ──────────────────────────────────────────────────────

/** Full-screen image lightbox overlay. */
function Lightbox({
  entry,
  onClose,
}: {
  entry: HistoryEntry;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isSick = entry.status === "sick";

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full mx-4 rounded-3xl overflow-hidden bg-surface-container-low border border-surface-container shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-square w-full">
          <Image
            src={entry.imageUrl}
            alt="Plant history snapshot"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
          />
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <StatusDot status={entry.status} />
            <span
              className={`text-sm font-medium ${
                isSick ? "text-error" : "text-primary"
              }`}
            >
              {isSick
                ? t.plantHistory.sick
                : t.plantHistory.healthy}
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            {formatRelativeDate(entry.createdAt)}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Icon name="history" className="text-2xl text-on-surface-variant" />
      </div>
      <h3 className="font-heading font-bold text-on-surface mb-1">
        {t.plantHistory.emptyTitle}
      </h3>
      <p className="text-sm text-on-surface-variant max-w-[200px]">
        {t.plantHistory.emptyDescription}
      </p>
    </div>
  );
}

// ─── Timeline Entry ──────────────────────────────────────────────────────────

function TimelineEntry({
  entry,
  isLast,
  onClick,
}: {
  entry: HistoryEntry;
  isLast: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const isSick = entry.status === "sick";

  return (
    <div className="flex gap-3">
      {/* Timeline connector — dot + vertical line */}
      <div className="flex flex-col items-center pt-1">
        {/* Status dot on the timeline */}
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
            isSick
              ? "bg-error border-error/30"
              : "bg-primary border-primary/30"
          }`}
        />
        {/* Connecting line (hidden for last entry) */}
        {!isLast && (
          <div className="w-px flex-1 bg-surface-container-highest mt-1" />
        )}
      </div>

      {/* Content card */}
      <button
        type="button"
        onClick={onClick}
        className="flex-1 mb-3 flex items-center gap-3 p-2 rounded-2xl bg-surface-container-low border border-surface-container hover:bg-surface-container hover:border-surface-container-high transition-all group cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
          <Image
            src={entry.imageUrl}
            alt="Plant snapshot"
            fill
            sizes="48px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Meta info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <StatusDot status={entry.status} />
            <span
              className={`text-xs font-semibold ${
                isSick ? "text-error" : "text-primary"
              }`}
            >
              {isSick
                ? t.plantHistory.sick
                : t.plantHistory.healthy}
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant">
            {formatRelativeDate(entry.createdAt)}
          </span>
        </div>

        {/* Expand arrow */}
        <Icon
          name="open_in_full"
          className="text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PlantHistoryTimeline({ plantId }: PlantHistoryTimelineProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  // Fetch history entries — extracted so it can be called on mount and on updates
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/plants/${plantId}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch plant history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [plantId]);

  // Fetch on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Re-fetch when EditPlantForm dispatches a "plant-history-updated" event
  // after a successful image upload + save
  useEffect(() => {
    const handler = () => { fetchHistory(); };
    window.addEventListener("plant-history-updated", handler);
    return () => window.removeEventListener("plant-history-updated", handler);
  }, [fetchHistory]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Icon name="timeline" className="text-primary" />
          <h2 className="font-heading font-bold text-on-surface text-lg">
            {t.plantHistory.title}
          </h2>
          {history.length > 0 && (
            <span className="ml-auto text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Icon
              name="progress_activity"
              className="animate-spin text-primary text-xl"
            />
          </div>
        ) : history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            {history.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLast={i === history.length - 1}
                onClick={() => setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {selectedEntry && (
        <Lightbox
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
}
