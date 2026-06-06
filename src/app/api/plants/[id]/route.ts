import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { diagnosePlant } from "@/lib/gemini";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { tasks: true },
  });
  if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plant);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.plant.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}

/**
 * Save a base64 data URL image to disk and return the public URL.
 * Returns null if imageData is missing or malformed.
 */
async function saveImageToDisk(imageData: string): Promise<string | null> {
  const matches = imageData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const ext = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

/**
 * Extract the raw base64 string and mime type from a data URL.
 */
function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } | null {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  return { mimeType: matches[1]!, base64: matches[2]! };
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, room, imageData } = body;
    
    let imageUrl: string | undefined;
    let diagnosisFields: Record<string, string | null> | undefined;

    // When a new image is uploaded, save it and run health diagnosis
    if (imageData) {
      imageUrl = (await saveImageToDisk(imageData)) ?? undefined;

      const parsed = parseDataUrl(imageData);
      if (parsed) {
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
