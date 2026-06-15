# Confirm Page

**Route**: `/confirm` (mapped to `src/app/(main)/confirm/page.tsx`)
**Rendering**: Client Component (`"use client"`)

---

## Overview

The confirm page is the second step of the "add a plant" flow. After AI identifies a plant on the `/identify` page, the user is sent here to customize the nickname and location before saving to their garden.

---

## Functionality

### Data Recovery from Session

On mount, the page reads from `sessionStorage`:
- `florafile_new_plant` — The identified plant data (commonName, scientificName, care details)
- `florafile_new_image` — The captured image as a data URL

If no plant data is found (e.g., direct navigation), a loading message is shown.

### Form Fields

| Field | Type | Default | Behavior |
|---|---|---|---|
| **Nickname** | Text input | Plant's common name | Editable, user can personalize |
| **Location** | Select dropdown | First available location | Fetched from `/api/locations` |

### Plant Preview

A preview section at the top of the form shows:
- The captured plant image (or a placeholder icon)
- Common name and scientific name (italic)

### Save Action

On form submit:
1. POSTs to `/api/plants` with: nickname, commonName, scientificName, room, light, water, toxicity, careLevel, description, and the base64 image data
2. The API route:
   - Uploads the image to S3 (graceful failure — plant saves without image if bucket is unreachable)
   - Runs AI health diagnosis on the image
   - Creates the Plant record in the database
3. Clears `sessionStorage` entries
4. Redirects to the dashboard (`/`)

### Error Handling

If the save fails, an alert is shown and the form remains editable (the saving state is reset).

---

## Data Flow

```
/identify → sessionStorage → /confirm → POST /api/plants → Database + S3 → redirect /
```

This sessionStorage-based handoff avoids re-uploading the image and keeps the identify → confirm flow stateless between server requests.

---

## Components Used

- [`Icon`](../src/components/Icon.tsx) — Material Symbols icon wrapper
