import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

/**
 * Single NextAuth configuration — no split needed for Next.js 16.
 *
 * Uses PrismaAdapter for database-backed user/account storage with
 * JWT session strategy (lighter than DB sessions for every request).
 *
 * Google and GitHub providers both allow dangerous email account linking
 * so a user who signs up with Google can later sign in with GitHub
 * if both share the same email address.
 */
export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Persist the database user ID into the JWT so it's available
     * in the session without an extra DB lookup on every request.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    /**
     * Bootstrap household on first sign-in.
     *
     * The PrismaAdapter creates the User row before this callback fires,
     * so we can safely look it up. If the user already has a
     * HouseholdMember record (returning user) this is a no-op.
     */
    async signIn({ user }) {
      if (!user?.id) return true

      const existing = await prisma.householdMember.findUnique({
        where: { userId: user.id },
      })

      if (!existing) {
        // First sign-in — create a fresh household and link this user to it
        const household = await prisma.household.create({ data: {} })
        await prisma.householdMember.create({
          data: { userId: user.id, householdId: household.id },
        })
      }

      return true
    },
  },
})
