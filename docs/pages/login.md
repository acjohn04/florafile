# Login Page

**Route**: `/login` (mapped to `src/app/(auth)/login/page.tsx`)
**Rendering**: Server Component (SSR)

---

## Overview

The login page is the single entry point for authentication. It supports OAuth sign-in through Google and GitHub providers. Unauthenticated users are redirected here by the proxy (`src/proxy.ts`).

---

## Functionality

### Session Check

On load, the page checks for an existing session via `auth()`. If the user is already authenticated, they are immediately redirected to the dashboard (`/`).

### OAuth Providers

Two sign-in buttons are rendered, each wrapped in a `<form>` that calls a server action:

| Provider | Server Action | Visual Style |
|---|---|---|
| **Google** | `signIn("google")` | White/surface background, Google logo |
| **GitHub** | `signIn("github")` | Dark `#24292e` background, inverted GitHub logo |

Both providers use `allowDangerousEmailAccountLinking`, so a user who signs up with Google can later sign in with GitHub (or vice versa) if both accounts share the same email.

### Branding

A minimal brand header displays the FloraFile logo (Material Symbol `spa`) and name in the primary color.

---

## Layout

The login page uses the `(auth)` route group layout, which provides:
- A centered full-viewport container
- No navigation bar (unlike the `(main)` group)
- A glassmorphism card (`glass-panel`) for the sign-in form

---

## Security Notes

- The `signIn()` calls are **server actions** — credentials never flow through client-side JavaScript
- After successful OAuth, Auth.js creates a JWT session and sets an `authjs.session-token` cookie
- The proxy layer reads this cookie for subsequent page loads
