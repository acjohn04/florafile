import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";
import { diagnosePlant } from "@/lib/gemini";
import {
  uploadImage,
  buildProfileKey,
  parseDataUrl,
} from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const householdId = await requireHousehold();
  const { id } = await params;
  const plant = await prisma.plant.findFirst({
    where: { id, householdId },
    include: { tasks: true },
  });
  if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plant);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const householdId = await requireHousehold();
  const { id } = await params;
  // Guard: only allow deletion of plants belonging to the user's household
  const plant = await prisma.plant.findFirst({ where: { id, householdId } });
  if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.plant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

/**
 * Run AI diagnosis on an image and return the fields to store on the Plant.
 * Returns healthy defaults if the diagnosis API fails (graceful degradation).
 */
async function runDiagnosis(base64: string, mimeType: string) {
  try {
    const result = await diagnosePlant(base64, mimeType);

    // Healthy plant — clear diagnosis fields
    if (result.status === "healthy") {
      return {
        status: "healthy",
        diagnosisName: null,
        severity: null,
        diagnosisDescription: null,
        recoverySteps: null,
      };
    }

    // Sick plant — persist diagnosis data
    return {
      status: "sick",
      diagnosisName: result.diagnosisName,
      severity: result.severity,
      diagnosisDescription: result.description,
      recoverySteps: JSON.stringify(result.recoverySteps),
    };
  } catch (error) {
    // If AI call fails, default to healthy so the plant still saves
    console.error("Diagnosis failed, defaulting to healthy:", error);
    return {
      status: "healthy",
      diagnosisName: null,
      severity: null,
      diagnosisDescription: null,
      recoverySteps: null,
    };
  }
}

/**
 * Snapshot the plant's current image + status into the history table.
 * Only creates a history entry if the plant already has an image.
 * The history image is uploaded to the bucket under a separate key.
 */
async function snapshotToHistory(
  plantId: string,
  currentImageUrl: string | null,
  currentStatus: string,
): Promise<void> {
  // Skip if the plant has no image yet (nothing to snapshot)
  if (!currentImageUrl) return;

  // The current image URL is already in the bucket (or a legacy /uploads/ path).
  // We store the existing URL directly — no need to re-upload.
  await prisma.plantHistory.create({
    data: {
      plantId,
      imageUrl: currentImageUrl,
      status: currentStatus === "sick" ? "sick" : "healthy",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const householdId = await requireHousehold();
    const { id } = await params;

    // Guard: only allow updates to plants belonging to the user's household
    const existing = await prisma.plant.findFirst({ where: { id, householdId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { nickname, room, imageData } = body;
    
    let imageUrl: string | undefined;
    let diagnosisFields: Record<string, string | null> | undefined;

    // When a new image is uploaded, save it to the bucket and run health diagnosis.
    // Before updating, snapshot the current state into the history timeline.
    if (imageData) {
      // Snapshot current image + status into history before overwriting
      await snapshotToHistory(id, existing.imageUrl, existing.status);

      const parsed = parseDataUrl(imageData);
      if (parsed) {
        // Upload new image to bucket
        const key = buildProfileKey(id, parsed.ext);
        imageUrl = await uploadImage(parsed.buffer, key, parsed.mimeType);

        // Run AI diagnosis on the new image
        diagnosisFields = await runDiagnosis(parsed.base64, parsed.mimeType);
      }
    }

    const plant = await prisma.plant.update({
      where: { id },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(room !== undefined && { room }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(diagnosisFields !== undefined && diagnosisFields),
      },
    });

    return NextResponse.json(plant);
  } catch (error) {
    console.error("Failed to update plant:", error);
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 });
  }
}
