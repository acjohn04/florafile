import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateICS, CalendarTask } from "@/lib/calendar";
import { generateCareSchedule } from "@/lib/gemini";
import { requireHousehold } from "@/lib/auth";

export async function GET() {
  const householdId = await requireHousehold();

  // 1. Fetch all plants for the user
  const plants = await prisma.plant.findMany({
    where: { householdId },
  });

  if (plants.length === 0) {
    // Return empty calendar if no plants
    const emptyIcs = generateICS([]);
    return new NextResponse(emptyIcs, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="florafile-smart-schedule.ics"`,
      },
    });
  }

  // 2. Generate AI Schedule
  const now = new Date();
  const aiTasks = await generateCareSchedule(plants, now);

  // 3. Map to CalendarTask format
  const calendarTasks: CalendarTask[] = aiTasks.map((t) => {
    // Gemini returns YYYY-MM-DD. We parse it as local time to avoid timezone shifts.
    const [year, month, day] = t.dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 9, 0, 0); // 9am local
    return {
      label: t.label,
      description: t.description,
      date,
    };
  });

  // 4. Generate ICS string
  const ics = generateICS(calendarTasks);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="florafile-smart-schedule.ics"`,
    },
  });
}
