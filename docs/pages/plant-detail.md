# Plant Detail Page

**Route**: `/plants/[id]` (mapped to `src/app/(main)/plants/[id]/page.tsx`)
**Rendering**: Server Component (page) + Client Components (form, timeline)

---

## Overview

The plant detail page is the central management view for a single plant. It provides inline editing, photo upload with AI health diagnosis, care information, and a visual history timeline. The layout uses a responsive two-column design.

---

## Layout

### Desktop (lg+)
```
┌──────────────────────┬──────────────────┐
│                      │  Care Summary    │
│   EditPlantForm      │  Card            │
│   (nickname, room,   ├──────────────────┤
│    image, diagnosis) │  Plant History   │
│                      │  Timeline        │
└──────────────────────┴──────────────────┘
```

### Mobile
The right column stacks below the form in a single-column layout.

---

## Sub-Components

### `EditPlantForm` (Client Component)

The primary form for managing a plant, with the following features:

#### Auto-Save

All edits save automatically — there is no explicit "Save" button:
- **Nickname**: Debounced at 800ms — saves after the user stops typing
- **Room/Location**: Saves immediately on dropdown change
- **Image**: Saves immediately on file selection

A subtle saving indicator appears in the header during saves.

#### Image Upload + AI Diagnosis

Clicking the plant image (or the empty-state uploader) opens a file picker:

1. Selected file is resized to 800×800px WebP client-side
2. An instant preview is shown while the save runs
3. The PATCH request sends the base64 image to the server
4. Server-side:
   - **Snapshots** the current image + status to `PlantHistory` (before overwriting)
   - **Uploads** the new image to S3
   - **Runs AI diagnosis** via `diagnosePlant()`
   - **Updates** the Plant record with new image URL, status, and diagnosis fields
5. A scanning animation overlays the image during diagnosis
6. On completion, the `DiagnosisCard` appears (if sick) and the timeline updates

#### Diagnosis Card

When a plant is diagnosed as "sick", an inline card displays:
- **Severity badge**: Low / Medium / High with color coding
- **Diagnosis name**: e.g., "Root Rot", "Spider Mites"
- **Description**: What's happening and why
- **Recovery steps**: Numbered, actionable steps to fix the problem

#### Delete Plant

The plant can be deleted via `DELETE /api/plants/[id]`, which:
- Deletes the Plant and cascaded PlantHistory records
- Best-effort cleanup of all S3 bucket images (profile + history)

---

### `CareSummaryCard` (Server Component)

A compact card in the right column showing the plant's care requirements:
- Light requirements
- Watering frequency
- Toxicity information
- Care level
- Scientific name and description

---

### `PlantHistoryTimeline` (Client Component)

A visual timeline of the plant's health history, showing snapshots taken every time a new photo is uploaded.

#### Features
- **Timeline layout**: Vertical with status-colored dots and connecting lines
- **Entries**: Thumbnail image, health status (healthy/sick as colored dot), and relative timestamp
- **Lightbox**: Clicking an entry opens a full-screen image viewer with status info
- **Live updates**: Listens for `"plant-history-updated"` custom events dispatched by `EditPlantForm`
- **Empty state**: Encouraging message when no history exists yet

#### Data Source
Fetches from `GET /api/plants/[id]/history`, returns entries ordered by `createdAt desc`.

---

## API Endpoints

### `GET /api/plants/[id]`
Returns the full plant record including history entries. Scoped to the user's household.

### `PATCH /api/plants/[id]`
Updates plant fields (nickname, room, image). When `imageData` is provided, also runs the snapshot → upload → diagnosis pipeline.

### `DELETE /api/plants/[id]`
Removes the plant, cascades history deletion, and cleans up S3 bucket images.

### `GET /api/plants/[id]/history`
Returns the plant's history entries (image snapshots with timestamps and status).
