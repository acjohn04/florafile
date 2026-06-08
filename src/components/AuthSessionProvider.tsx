'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * Client-side session provider wrapper.
 *
 * Wraps the app tree so client components can access the Auth.js
 * session via the `useSession()` hook from next-auth/react.
 */
export default function AuthSessionProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return <SessionProvider>{children}</SessionProvider>
}
