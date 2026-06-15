# Settings Page

**Route**: `/settings` (mapped to `src/app/(main)/settings/page.tsx`)
**Rendering**: Client Component (`"use client"`)

---

## Overview

The settings page provides account management, household sharing, and location management. It's divided into four card sections.

---

## Sections

### 1. Profile Card

Displays the authenticated user's information:
- **Avatar**: OAuth profile image (or a generated initial) with a primary ring
- **Name and email**: From the Auth.js session
- **Sign Out**: Red destructive button that calls `signOut({ callbackUrl: "/login" })`

---

### 2. Household ID Card

Displays the user's current household ID for sharing with other users.

| Element | Behavior |
|---|---|
| **ID display** | Monospace text in a pill, fully selectable |
| **Copy button** | Copies to clipboard via `navigator.clipboard.writeText()` with a fallback for older browsers. Shows "Copied!" confirmation for 2 seconds. |

The household ID is fetched from `GET /api/household` on mount.

---

### 3. Join Household Card

Allows the user to join a different household by pasting an existing household ID.

- **Input**: Monospace text field for the household ID
- **Submit**: Sends `POST /api/household` with `{ householdId: "..." }`
- **Feedback**:
  - ✅ Success: Green confirmation with check icon, local state updates
  - ❌ Error: Red error message with error icon

Joining a household reassigns the user's `HouseholdMember` record, giving them access to the new household's plants and locations.

---

### 4. Manage Locations (`ManageLocations` Component)

A CRUD interface for the household's room/location list. Locations are used in the plant assignment dropdown.

#### Features

| Action | API | Details |
|---|---|---|
| **List** | `GET /api/locations` | Fetches all locations for the household |
| **Add** | `POST /api/locations` | Creates a new location with the given name |
| **Edit** | `PUT /api/locations/[id]` | Inline rename with Enter to save, Escape to cancel |
| **Delete** | `DELETE /api/locations/[id]` | Removes the location (red delete button) |

Default locations (Living Room, Bedroom, Office, Kitchen, Bathroom, Balcony, Hallway) are seeded when a household is first created.

---

## API Endpoints

### `GET /api/household`
Returns `{ householdId }` for the current user.

### `POST /api/household`
Joins an existing household. Body: `{ householdId: string }`.

### `GET /api/locations`
Returns all locations for the user's household.

### `POST /api/locations`
Creates a new location. Body: `{ name: string }`.

### `PUT /api/locations/[id]`
Renames a location. Body: `{ name: string }`.

### `DELETE /api/locations/[id]`
Deletes a location.
