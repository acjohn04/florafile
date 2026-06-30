import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditPlantForm } from "./EditPlantForm";
import { PlantHistoryTimeline } from "./PlantHistoryTimeline";
import { CareSummaryCard } from "./CareSummaryCard";

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const plant = await prisma.plant.findUnique({
    where: { id }
  });

  if (!plant) {
    notFound();
  }

  // Passing plant data including diagnosis fields to client component
  const plantData = {
    id: plant.id,
    nickname: plant.nickname,
    room: plant.room,
    imageUrl: plant.imageUrl,
    commonName: plant.commonName,
    scientificName: plant.scientificName,
    status: plant.status,
    light: plant.light,
    water: plant.water,
    toxicity: plant.toxicity,
    careLevel: plant.careLevel,
    description: plant.description,
    diagnosisName: plant.diagnosisName,
    severity: plant.severity,
    diagnosisDescription: plant.diagnosisDescription,
    recoverySteps: plant.recoverySteps,
  };

  // Care data for the right-column care summary card
  const hasCareData = !!(plant.light && plant.water && plant.toxicity && plant.careLevel);

  return (
    <div className="flex flex-col h-full bg-surface">
      <main className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {/* Two-column layout: plant details on left, care summary + timeline on right.
            On mobile, the right column stacks below. */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left column — plant edit form */}
          <div className="flex-1 min-w-0 max-w-lg">
            <EditPlantForm plant={plantData} />
          </div>

          {/* Right column — care summary + plant history timeline */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Care summary card */}
              {hasCareData && (
                <CareSummaryCard
                  light={plant.light!}
                  water={plant.water!}
                  toxicity={plant.toxicity!}
                  careLevel={plant.careLevel!}
                  scientificName={plant.scientificName}
                  description={plant.description}
                />
              )}

              {/* Plant history timeline */}
              <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-5">
                <PlantHistoryTimeline plantId={plant.id} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
