import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireHousehold } from "@/lib/auth";

/**
 * GET /api/household
 * Returns the current user's householdId.
 */
export async function GET() {
  const householdId = await requireHousehold();
  return NextResponse.json({ householdId });
}

/**
 * POST /api/household/join
 * Body: { householdId: string }
 *
 * Moves the current user to a different household.
 * Validates the target household exists before updating the membership record.
 * The old (now-empty) household is left intact — it can be GC'd later if needed.
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  const { householdId: targetId } = await request.json();

  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "householdId is required" }, { status: 400 });
  }

  // Validate the target household exists
  const household = await prisma.household.findUnique({ where: { id: targetId } });
  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  // Upsert: move the user's membership to the new household.
  // The @@unique([userId]) constraint means there can only be one membership record per user.
  await prisma.householdMember.upsert({
    where: { userId },
    update: { householdId: targetId },
    create: { userId, householdId: targetId },
  });

  return NextResponse.json({ householdId: targetId });
}
