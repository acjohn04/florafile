"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";
import type { PlantData } from "@/types";

export default function ConfirmPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [image, setImage] = useState<string | null>(null);
  
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState("Living Room");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedPlant = sessionStorage.getItem("florafile_new_plant");
    const savedImage = sessionStorage.getItem("florafile_new_image");
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedPlant) setPlantData(JSON.parse(savedPlant));
     
    if (savedImage) setImage(savedImage);
    
    if (savedPlant) {
      const p = JSON.parse(savedPlant);
      setNickname(p.commonName);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantData) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          commonName: plantData.commonName,
          scientificName: plantData.scientificName,
          room,
          light: plantData.light,
          water: plantData.water,
          toxicity: plantData.toxicity,
          careLevel: plantData.careLevel,
          description: plantData.description,
          imageData: image,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      sessionStorage.removeItem("florafile_new_plant");
      sessionStorage.removeItem("florafile_new_image");
      
      router.push("/");
    } catch (err) {
      console.error(err);
      alert(t.confirm.failedSave);
      setIsSaving(false);
    }
  };

  if (!plantData) return <div className="p-8 text-center text-on-surface-variant">{t.confirm.loading}</div>;

  const rooms = [
    t.confirm.rooms.livingRoom,
    t.confirm.rooms.bedroom,
    t.confirm.rooms.office,
    t.confirm.rooms.kitchen,
    t.confirm.rooms.bathroom,
    t.confirm.rooms.balcony,
    t.confirm.rooms.hallway
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-on-surface">{t.confirm.title}</h1>
        <p className="text-on-surface-variant mt-2">{t.confirm.subtitle}</p>
      </header>

      <form onSubmit={handleSave} className="bg-surface-container-low p-6 rounded-3xl border border-surface-container space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-surface-container">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Plant preview" className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
              <Icon name="eco" />
            </div>
          )}
          <div>
            <p className="font-bold text-on-surface">{plantData.commonName}</p>
            <p className="text-sm italic text-on-surface-variant">{plantData.scientificName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">{t.confirm.nicknameLabel}</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-surface-container-lowest border-b-2 border-outline focus:border-primary px-4 py-3 rounded-t-xl outline-none text-on-surface transition-colors"
              placeholder={t.confirm.nicknamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">{t.confirm.locationLabel}</label>
            <div className="relative">
              <select 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline focus:border-primary px-4 py-3 rounded-xl outline-none text-on-surface appearance-none transition-colors"
              >
                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-on-primary font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>{t.confirm.savingButton}</>
          ) : (
            <><Icon name="save" /> {t.confirm.saveButton}</>
          )}
        </button>
      </form>
    </div>
  );
}
