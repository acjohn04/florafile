import { nextAuth } from "../auth"
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
