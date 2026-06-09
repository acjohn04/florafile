import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditPlantForm } from "./EditPlantForm";
import { PlantHistoryTimeline } from "./PlantHistoryTimeline";

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
    status: plant.status,
    diagnosisName: plant.diagnosisName,
    severity: plant.severity,
    diagnosisDescription: plant.diagnosisDescription,
    recoverySteps: plant.recoverySteps,
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <main className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {/* Two-column layout: form on left, history timeline on right.
            On mobile, the timeline stacks below the form. */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Main content — plant edit form */}
          <div className="flex-1 min-w-0">
            <EditPlantForm plant={plantData} />
          </div>

          {/* Sidebar — plant history timeline */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6 bg-surface-container-lowest border border-surface-container rounded-3xl p-5">
              <PlantHistoryTimeline plantId={plant.id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
