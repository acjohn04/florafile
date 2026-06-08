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
  const household = await prisma.household.create({ data: {} })
  await prisma.householdMember.create({
    data: { userId, householdId: household.id },
  })
  return household.id
}
