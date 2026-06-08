import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 "proxy" — replaces the deprecated middleware.ts convention.
 *
 * Lightweight UX redirect layer: checks for an Auth.js session cookie
 * and bounces unauthenticated visitors to /login.
 *
 * Real authorization is enforced inside every server action and API
 * route via `requireAuth()`. The proxy is defense-in-depth for UX,
 * not the sole security boundary.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login page, API routes, and static assets through.
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Auth.js sets different cookie names depending on the environment:
  //   development → "authjs.session-token"
  //   production  → "__Secure-authjs.session-token"
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token')

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.webp$).*)'],
}
