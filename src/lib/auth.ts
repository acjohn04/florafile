import { nextAuth } from "../auth"
import { prisma } from "./db"
import type { Session } from "next-auth"

/**
 * Returns the current Auth.js session.
 *
 * This wrapper exists as the single place to retrieve the session
 * across the app. It can be extended later for demo mode or other
 * session-override logic without changing every call site.
 */
export async function auth(): Promise<Session | null> {
  return await nextAuth()
}

/**
 * Convenience wrapper that throws if the user isn't authenticated.
 * Use at the top of server actions / API routes that mutate data.
 *
 * @returns The authenticated user's ID.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

/**
 * Returns the householdId for the current authenticated user.
 *
 * If no HouseholdMember record exists yet (e.g. the user signed in before
 * the household feature was introduced, or the signIn callback was skipped),
 * a new Household is created and linked here on first access — same logic
 * as the signIn bootstrap callback, just deferred.
 *
 * @returns The user's householdId string.
 */
export async function requireHousehold(): Promise<string> {
  const userId = await requireAuth()

  // Try to find an existing membership first (fast path for most requests)
  const existing = await prisma.householdMember.findUnique({
    where: { userId },
    select: { householdId: true },
  })

  if (existing) return existing.householdId

  // Slow path: bootstrap a household for users who pre-date this feature
  // Also seed the default locations so they have something to pick from.
  // We explicitly set sequential createdAt dates so that orderBy: { createdAt: "asc" }
  // preserves this logical order (SQLite timestamps are only precise to the second otherwise).
  const now = Date.now();
  const household = await prisma.household.create({
    data: {
      locations: {
        create: [
          { name: "Living Room", createdAt: new Date(now + 1000) },
          { name: "Bedroom", createdAt: new Date(now + 2000) },
          { name: "Office", createdAt: new Date(now + 3000) },
          { name: "Kitchen", createdAt: new Date(now + 4000) },
          { name: "Bathroom", createdAt: new Date(now + 5000) },
          { name: "Balcony", createdAt: new Date(now + 6000) },
          { name: "Hallway", createdAt: new Date(now + 7000) },
        ],
      },
    },
  })
  await prisma.householdMember.create({
    data: { userId, householdId: household.id },
  })
  return household.id
}

/**
 * Returns the household details (like hardinessZone) for the current user.
 */
export async function requireHouseholdData(): Promise<{ id: string; hardinessZone: string | null }> {
  const householdId = await requireHousehold();
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { id: true, hardinessZone: true }
  });
  if (!household) throw new Error("Household not found");
  return household;
}

