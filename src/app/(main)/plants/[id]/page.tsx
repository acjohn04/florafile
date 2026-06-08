import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditPlantForm } from "./EditPlantForm";

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
        <EditPlantForm plant={plantData} />
      </main>
    </div>
  );
}
