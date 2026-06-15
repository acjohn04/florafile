# Architecture

FloraFile is a full-stack Next.js 16 web application for AI-powered plant identification, health diagnosis, and care scheduling. This document describes the technology stack, project structure, and key architectural decisions.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.6 | Server components, API routes, file-based routing |
| **Language** | TypeScript | 5.x | Static typing across the entire codebase |
| **UI** | React | 19.2.4 | Component rendering |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with custom design tokens |
| **Database** | SQLite via Prisma | Prisma 7.8 | File-based database, zero infrastructure |
| **ORM Adapter** | `@prisma/adapter-better-sqlite3` | 7.8 | Native SQLite driver for Prisma |
| **Auth** | Auth.js (NextAuth v5) | 5.0 beta | OAuth via Google & GitHub, JWT sessions |
| **AI** | Google Gemini (`@google/genai`) | 2.5+ | Plant identification, diagnosis, schedule generation |
| **Object Storage** | AWS S3 SDK → Railway Tigris | 3.x | Plant image storage (S3-compatible) |
| **Validation** | Zod | 4.x | Runtime schema validation for AI responses |
| **Testing** | Vitest + Testing Library | 4.x | Unit tests |
| **Containerization** | Docker (multi-stage) | — | Production deployment |
| **Fonts** | Google Fonts | — | Quicksand (headings), Plus Jakarta Sans (body) |
| **Icons** | Material Symbols Outlined | — | Icon system via `<Icon>` component |

---

## Project Structure

```
florafile/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite)
├── prisma.config.ts           # Prisma v7 config (URL source)
├── public/                    # Static assets
├── src/
│   ├── auth.ts                # NextAuth configuration (providers, adapter, callbacks)
│   ├── proxy.ts               # Next.js 16 proxy (replaces middleware.ts)
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, metadata, AuthSessionProvider)
│   │   ├── globals.css        # Design system tokens + global styles
│   │   ├── (auth)/            # Auth route group (login page)
│   │   │   └── login/page.tsx
│   │   ├── (main)/            # Authenticated route group
│   │   │   ├── layout.tsx     # Adds Navigation bar + content container
│   │   │   ├── page.tsx       # Dashboard (plant inventory)
│   │   │   ├── identify/      # AI plant identification
│   │   │   ├── confirm/       # Save identified plant to garden
│   │   │   ├── plants/[id]/   # Plant detail (edit, diagnose, history)
│   │   │   ├── playbook/      # Weekly care schedule (.ics export)
│   │   │   └── settings/      # Profile, household, locations
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth handler
│   │       ├── household/     # Household CRUD
│   │       ├── identify/      # AI identification endpoint
│   │       ├── locations/     # Location CRUD
│   │       ├── plants/        # Plant CRUD + diagnosis
│   │       ├── playbook/      # Care schedule generation + ICS export
│   │       └── storage/       # S3 image proxy
│   ├── components/            # Shared UI components
│   ├── generated/prisma/      # Auto-generated Prisma client
│   ├── i18n/                  # Internationalization dictionaries
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts            # Session helpers (requireAuth, requireHousehold)
│   │   ├── db.ts              # Prisma singleton
│   │   ├── gemini.ts          # Gemini AI integration
│   │   ├── storage.ts         # S3 upload/delete/URL helpers
│   │   └── calendar.ts        # ICS calendar generation
│   └── types/                 # Shared TypeScript types
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local Docker setup
└── vitest.config.ts           # Test configuration
```

---

## Route Groups

The App Router uses **two route groups** to separate concerns:

### `(auth)` — Unauthenticated

Contains the `/login` page. Uses a minimal layout without the navigation bar.

### `(main)` — Authenticated

All app pages. The layout wraps children with the `<Navigation>` component (desktop top bar + mobile bottom bar) and a centered content container (max 1200px).

---

## Data Flow

### Plant Identification Flow

```
User uploads photo
  → Client: ImageUploader captures + resizes to WebP (800px max)
  → Client: POSTs FormData to /api/identify
  → Server: Extracts base64, calls Gemini identifyPlant()
  → Server: Returns { commonName, scientificName, light, water, ... }
  → Client: Shows result card with CareSummaryGrid
  → User clicks "Add to Garden"
  → Client: Stores result in sessionStorage, navigates to /confirm
  → Confirm page: User sets nickname + room, POSTs to /api/plants
  → Server: Uploads image to S3, runs AI diagnosis, creates Plant record
  → Redirects to dashboard
```

### Photo Upload + Diagnosis Flow (Existing Plant)

```
User clicks plant image → file picker opens
  → Client: Resizes image, shows instant preview
  → Client: PATCHes /api/plants/[id] with base64 imageData
  → Server: Snapshots current image+status to PlantHistory
  → Server: Uploads new image to S3 under florafile/plants/{id}/profile/
  → Server: Runs AI diagnosis via diagnosePlant()
  → Server: Updates Plant record (imageUrl, status, diagnosis fields)
  → Client: Updates UI, dispatches "plant-history-updated" event
  → PlantHistoryTimeline re-fetches and shows new entry
```

### Care Schedule (Playbook) Flow

```
User clicks "Download Smart Schedule"
  → Client: window.location.href = /api/playbook/export
  → Server: Fetches all household plants
  → Server: Calls Gemini generateCareSchedule() with plant data
  → Server: Maps AI tasks to ICS calendar events (9am local)
  → Server: Returns .ics file as download
  → Browser: Downloads florafile-smart-schedule.ics
```

---

## Authentication Architecture

- **Provider**: Auth.js v5 with PrismaAdapter, JWT session strategy
- **OAuth**: Google and GitHub (with `allowDangerousEmailAccountLinking` for same-email linking)
- **Proxy** (`src/proxy.ts`): Lightweight UX redirect — checks for session cookie and bounces to `/login`. Not a security boundary.
- **Server-side guards**: `requireAuth()` and `requireHousehold()` enforce authorization in every API route and server component. These are the real security boundary.
- **Session enrichment**: The JWT callback persists the database user ID into the token so it's available without extra DB lookups.

---

## Household Model

FloraFile uses a **household-based multi-tenancy** model:

- Each `User` belongs to exactly one `Household` (enforced by unique constraint on `HouseholdMember.userId`)
- A `Household` is auto-created on first sign-in with default locations (Living Room, Bedroom, Office, etc.)
- Plants and Locations are scoped to a household, enabling shared access
- Users can join another household via the Settings page by pasting a household ID

---

## Image Storage

- **Provider**: Railway's Tigris S3-compatible bucket (private buckets)
- **Proxy**: Images are served through `/api/storage/[...key]` to avoid exposing bucket credentials
- **Key structure**:
  - Profile images: `florafile/plants/{plantId}/profile/{uuid}.webp`
  - History snapshots: `florafile/plants/{plantId}/history/{uuid}.webp`
- **Client-side resize**: Images are resized to max 800×800px and converted to WebP before upload

---

## AI Integration (Gemini)

Three AI functions in `src/lib/gemini.ts`, all using `gemini-2.5-flash`:

1. **`identifyPlant()`** — Takes a photo, returns species ID + care requirements. Uses structured JSON output with Zod validation.
2. **`diagnosePlant()`** — Analyzes a photo for health issues. Returns `status: "healthy" | "sick"` with diagnosis details and recovery steps.
3. **`generateCareSchedule()`** — Generates a 3-month care schedule for all plants. Returns dated tasks (max 50) for ICS export.

All AI responses use Gemini's `responseMimeType: "application/json"` with explicit `responseSchema` for type safety, then validated through Zod at runtime.

---

## Internationalization

- Dictionary-based approach in `src/i18n/`
- Server: `getDictionary()` for server components
- Client: `useTranslation()` hook for client components
- Currently English-only (`src/i18n/dictionaries/en.ts`)

---

## Key Patterns

| Pattern | Usage |
|---|---|
| **Autosave with debounce** | Plant nickname field (800ms debounce), room dropdown (immediate) |
| **Optimistic UI** | Image preview shown instantly while upload + diagnosis runs in background |
| **Event-driven updates** | `window.dispatchEvent(new CustomEvent("plant-history-updated"))` to coordinate sibling components |
| **Graceful degradation** | AI diagnosis failure defaults to "healthy"; image upload failure saves plant without image |
| **Prisma singleton** | Stored on `globalThis` to survive HMR reloads in development |
| **Session-based data passing** | `sessionStorage` carries identified plant data from `/identify` to `/confirm` |
