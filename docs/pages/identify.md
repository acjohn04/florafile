# Identify Page

**Route**: `/identify` (mapped to `src/app/(main)/identify/page.tsx`)
**Rendering**: Client Component (`"use client"`)

---

## Overview

The identify page is where users photograph or upload an image of a plant to have it identified by Google Gemini AI. It returns the species name, scientific name, care requirements, and a description — then offers a one-click path to save the plant to the user's garden.

---

## Functionality

### Image Capture

The `<ImageUploader>` component provides two input methods:
- **Camera capture**: Opens the device camera (uses `capture="environment"` on mobile)
- **File upload**: Browse for an existing image file

Images are automatically:
1. Resized to a maximum of 800×800 pixels
2. Converted to WebP format at 80% quality
3. Extracted as a base64 string for the API call

### AI Identification

When an image is selected:

1. A loading spinner appears on the uploader
2. The image is sent as `FormData` to `POST /api/identify`
3. The server calls `identifyPlant()` from `src/lib/gemini.ts`
4. Gemini returns structured JSON with: `commonName`, `scientificName`, `light`, `water`, `toxicity`, `careLevel`, `description`
5. The result is validated with Zod and returned to the client

### Result Display

On successful identification, an animated result card slides in with:
- **Header**: Common name + scientific name with a psychology icon
- **Description**: AI-generated description text
- **Care summary grid**: Four chips showing light, water, toxicity, and care level
- **Save button**: "Add to My Garden" CTA

### Error Handling

Errors are displayed in an error container using the design system's error tokens (red background, error icon).

### Save Flow

Clicking "Add to My Garden":
1. Stores the plant data in `sessionStorage` under `florafile_new_plant`
2. Stores the captured image in `sessionStorage` under `florafile_new_image`
3. Navigates to `/confirm` where the user can customize before saving

---

## API Endpoint

### `POST /api/identify`

- **Input**: `FormData` with an `image` field
- **Processing**: Extracts base64 from the file, calls Gemini with botanist prompt
- **Output**: JSON with `commonName`, `scientificName`, `light`, `water`, `toxicity`, `careLevel`, `description`
- **Validation**: Response validated against `IdentificationSchema` (Zod)

---

## Components Used

- [`ImageUploader`](../src/components/ImageUploader.tsx) — Camera/file input with resize + preview
- [`CareSummaryGrid`](../src/components/CareSummaryGrid.tsx) — 2×2 grid of care requirement chips
- [`Icon`](../src/components/Icon.tsx) — Material Symbols icon wrapper
