# Dashboard Page

**Route**: `/` (mapped to `src/app/(main)/page.tsx`)
**Rendering**: Server Component (SSR, `force-dynamic`)

---

## Overview

The dashboard is the main landing page after authentication. It displays the user's plant collection and provides quick-access action cards for the two primary workflows: identifying new plants and generating care schedules.

---

## Functionality

### Health Summary

The page header shows a dynamic summary of the user's garden health:
- **Thriving count**: Number of plants with `status === "healthy"`
- **Attention count**: Plants that need attention (any non-healthy status)

Text is sourced from the i18n dictionary with runtime interpolation for count and pluralization.

### Hero Action Cards

Two prominent cards link to the app's core AI features:

| Card | Route | Description |
|---|---|---|
| **Add New Plant** | `/identify` | Opens the AI identification camera/upload flow |
| **Weekly Playbook** | `/playbook` | Generates an AI care schedule as a downloadable .ics file |

Both cards use hover animations (background icon scales up) and the design system's container color tokens.

### Plant Inventory Grid

- Fetches all plants for the authenticated user's household, ordered by `createdAt desc`
- Renders each plant as a `<PlantCard>` in a responsive grid:
  - **Mobile**: 2 columns
  - **Tablet**: 3 columns
  - **Desktop**: 4 columns
- Each `PlantCard` links to `/plants/[id]` for the detail/edit view

### Empty State

When the user has no plants, a centered empty state displays:
- A large potted plant icon
- Encouraging copy to get started
- A primary CTA button linking to `/identify`

---

## Data Loading

1. `auth()` checks for an active session; redirects to `/login` if unauthenticated
2. `requireHousehold()` resolves (or lazy-creates) the user's household
3. `prisma.plant.findMany()` fetches all household plants

All data loading happens server-side — no client-side fetching needed for the initial render.

---

## Components Used

- [`PlantCard`](../src/components/PlantCard.tsx) — Displays plant thumbnail, nickname, room, and status badge
- [`Icon`](../src/components/Icon.tsx) — Material Symbols icon wrapper
