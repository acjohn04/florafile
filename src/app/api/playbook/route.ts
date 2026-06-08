import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";

function getMonday(d: Date) {
  const dObj = new Date(d);
  const day = dObj.getDay();
  const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);
  dObj.setDate(diff);
  dObj.setHours(0, 0, 0, 0);
  return dObj;
}

export async function GET() {
  const householdId = await requireHousehold();
  const now = new Date();
  const weekStart = getMonday(now);

  const tasks = await prisma.task.findMany({
    where: { householdId, weekStart },
    include: { plant: true },
    orderBy: { dayOfWeek: "asc" }
  });

  return NextResponse.json(tasks);
}

export async function POST() {
  const householdId = await requireHousehold();
  const now = new Date();
  const weekStart = getMonday(now);

  const existingTasks = await prisma.task.count({
    where: { householdId, weekStart }
  });

  if (existingTasks > 0) {
    return NextResponse.json({ message: "Tasks already exist for this week" });
  }

  const plants = await prisma.plant.findMany({ where: { householdId } });
  
  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    const dayOfWeek = (i % 7); // Spread evenly across 0-6
    
    await prisma.task.create({
      data: {
        householdId,
        plantId: plant.id,
        type: "water",
        label: `Water ${plant.nickname || plant.commonName}`,
        description: plant.water ? `Frequency: ${plant.water}` : "Check soil moisture first.",
        dayOfWeek,
        weekStart
      }
    });

    if (plant.room === "Bathroom" || plant.room === "Kitchen" || (plant.description && plant.description.toLowerCase().includes("humid"))) {
       await prisma.task.create({
        data: {
          householdId,
          plantId: plant.id,
          type: "mist",
          label: `Mist ${plant.nickname || plant.commonName}`,
          description: "Focus on newer leaves.",
          dayOfWeek: (dayOfWeek + 3) % 7,
          weekStart
        }
      });
    }
  }

  const newTasks = await prisma.task.findMany({
    where: { householdId, weekStart },
    include: { plant: true },
    orderBy: { dayOfWeek: "asc" }
  });

  return NextResponse.json(newTasks);
}
