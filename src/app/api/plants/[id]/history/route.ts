import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";

/**
 * GET /api/plants/[id]/history
 *
 * Returns all history entries for a plant, ordered by most recent first.
 * Each entry includes an image URL, health status, and timestamp.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const householdId = await requireHousehold();
  const { id } = await params;

  // Verify the plant belongs to the user's household
  const plant = await prisma.plant.findFirst({
    where: { id, householdId },
    select: { id: true },
  });

  if (!plant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const history = await prisma.plantHistory.findMany({
    where: { plantId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(history);
}
