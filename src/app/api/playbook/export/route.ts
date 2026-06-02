import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateICS } from "@/lib/calendar";

export async function GET() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const tasks = await prisma.task.findMany({
    where: { weekStart },
  });

  const ics = generateICS(tasks);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="florafile-playbook.ics"`,
    },
  });
}
