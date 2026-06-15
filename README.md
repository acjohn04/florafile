# 🌿 FloraFile

**Your Digital Garden Companion** — Identify, catalog, and care for your houseplants with AI-powered diagnostics and personalized care schedules.

FloraFile uses Google Gemini AI to identify plants from photos, diagnose health issues, and generate 3-month care calendars exportable to Google Calendar, Apple Calendar, and Outlook.

---

## Features

| Feature | Description |
|---|---|
| 📸 **Snap & Identify** | Photograph a plant to identify its species, care needs, and toxicity via Gemini AI |
| 🪴 **Inventory Management** | Catalog your plants by room/location with photos, nicknames, and status tracking |
| 🩺 **Plant Doctor** | Upload a photo to get AI health diagnosis with severity levels and recovery steps |
| 📅 **Weekly Playbook** | Auto-generate a 3-month care schedule and download as an `.ics` calendar file |
| 📜 **Health History** | Visual timeline of each plant's health snapshots over time |
| 🏠 **Household Sharing** | Share your garden with family members via household IDs |
| 🌍 **i18n Ready** | Dictionary-based internationalization (currently English) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Database | SQLite via [Prisma 7](https://www.prisma.io/) (`better-sqlite3` adapter) |
| Auth | [Auth.js v5](https://authjs.dev/) (Google + GitHub OAuth, JWT sessions) |
| AI | [Google Gemini](https://ai.google.dev/) (`gemini-2.5-flash`) |
| Storage | S3-compatible bucket ([Railway Tigris](https://www.tigrisdata.com/)) |
| Testing | Vitest + Testing Library |
| Deployment | Docker (multi-stage), Railway |

---

## Requirements

- **Node.js** ≥ 22.12.0
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)
- **OAuth credentials** — Google and/or GitHub OAuth app
- **S3-compatible bucket** (optional) — For image storage; plants save without images if unavailable

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/acjohn04/florafile.git
cd florafile
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite path (default: `file:./dev.db`) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `AUTH_SECRET` | ✅ | Random 32-byte secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | ✅* | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ✅* | Google OAuth client secret |
| `AUTH_GITHUB_ID` | ✅* | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | ✅* | GitHub OAuth client secret |
| `AWS_ENDPOINT_URL` | ❌ | S3-compatible bucket endpoint |
| `AWS_ACCESS_KEY_ID` | ❌ | Bucket access key |
| `AWS_SECRET_ACCESS_KEY` | ❌ | Bucket secret key |
| `AWS_S3_BUCKET_NAME` | ❌ | Bucket name |
| `AWS_DEFAULT_REGION` | ❌ | Bucket region (default: `auto`) |

*At least one OAuth provider is required.

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Docker

Run the app using Docker Compose:

```bash
docker-compose up -d --build
```

The app will be available at `http://localhost:3000`. The SQLite database is persisted in a Docker volume.

The Dockerfile uses a multi-stage build:
1. **deps** — Installs npm dependencies
2. **builder** — Generates Prisma client and builds Next.js
3. **runner** — Minimal production image with standalone output

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # OAuth login page
│   ├── (main)/                 # Authenticated pages
│   │   ├── page.tsx            # Dashboard (plant inventory)
│   │   ├── identify/           # AI plant identification
│   │   ├── confirm/            # Save new plant to garden
│   │   ├── plants/[id]/        # Plant detail + diagnosis
│   │   ├── playbook/           # Care schedule generator
│   │   └── settings/           # Profile + household + locations
│   └── api/                    # REST API routes
├── components/                 # Shared UI components
├── lib/                        # Core utilities (auth, db, AI, storage)
├── i18n/                       # Internationalization
└── types/                      # Shared TypeScript types
```

---

## Documentation

Detailed documentation is available in the [`docs/`](./docs) directory:

- **[Architecture](./docs/architecture.md)** — Tech stack, project structure, data flows, and key patterns
- **[Design System](./docs/DESIGN.md)** — Colors, typography, spacing, and component guidelines

### Page Documentation

- **[Dashboard](./docs/pages/dashboard.md)** — Plant inventory and health summary
- **[Login](./docs/pages/login.md)** — OAuth authentication flow
- **[Identify](./docs/pages/identify.md)** — AI plant identification
- **[Confirm](./docs/pages/confirm.md)** — Save identified plant to garden
- **[Plant Detail](./docs/pages/plant-detail.md)** — Edit, diagnose, and view history
- **[Playbook](./docs/pages/playbook.md)** — AI care schedule + ICS export
- **[Settings](./docs/pages/settings.md)** — Profile, household, and locations

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database browser |
| `npx prisma migrate dev` | Apply pending migrations |

---

## License

Private project.
