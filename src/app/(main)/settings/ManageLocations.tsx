"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";

type Location = { id: string; name: string };

export function ManageLocations() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocations();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLocation.trim() }),
      });
      if (res.ok) {
        setNewLocation("");
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setEditName(loc.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const res = await fetch(`/api/locations/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditName("");
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-surface-container h-32 rounded-3xl"></div>;
  }

  return (
    <section className="bg-surface-container-low rounded-3xl p-6 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-on-surface">{t.settings.locationsTitle}</h2>
      <p className="text-sm text-on-surface-variant">{t.settings.locationsDesc}</p>

      <ul className="space-y-2">
        {locations.map((loc) => (
          <li key={loc.id} className="flex items-center justify-between bg-surface-container px-4 py-3 rounded-2xl">
            {editingId === loc.id ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-surface-container-high rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  onClick={handleSaveEdit}
                  className="text-primary hover:bg-primary/10 p-2 rounded-full cursor-pointer transition-colors"
                  aria-label={t.settings.saveLocationButton}
                >
                  <Icon name="check" className="text-[18px]" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-on-surface-variant hover:bg-on-surface/10 p-2 rounded-full cursor-pointer transition-colors"
                  aria-label={t.settings.cancelLocationButton}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium text-on-surface">{loc.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(loc)}
                    className="text-on-surface-variant hover:bg-on-surface/10 p-2 rounded-full cursor-pointer transition-colors"
                  >
                    <Icon name="edit" className="text-[18px]" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="text-error hover:bg-error/10 p-2 rounded-full cursor-pointer transition-colors"
                    aria-label={t.settings.deleteLocationButton}
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder={t.settings.addLocationPlaceholder}
          className="flex-1 bg-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button
          type="submit"
          disabled={!newLocation.trim()}
          className="bg-secondary text-on-secondary px-5 py-3 rounded-2xl font-medium text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          <Icon name="add" className="text-[18px]" />
          {t.settings.addLocationButton}
        </button>
      </form>
    </section>
  );
}
