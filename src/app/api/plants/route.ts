import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";
import { diagnosePlant } from "@/lib/gemini";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET() {
  const householdId = await requireHousehold();
  const plants = await prisma.plant.findMany({
    where: { householdId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plants);
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

export async function POST(request: Request) {
  const householdId = await requireHousehold();
  const data = await request.json();
  const { imageData, ...plantData } = data;

  let imageUrl: string | null = null;
  let diagnosisFields = {
    status: "healthy",
    diagnosisName: null as string | null,
    severity: null as string | null,
    diagnosisDescription: null as string | null,
    recoverySteps: null as string | null,
  };

  if (imageData) {
    imageUrl = await saveImageToDisk(imageData);

    // Run AI health check on the uploaded image
    const parsed = parseDataUrl(imageData);
    if (parsed) {
      diagnosisFields = await runDiagnosis(parsed.base64, parsed.mimeType);
    }
  }

  const plant = await prisma.plant.create({
    data: {
      ...plantData,
      householdId,
      ...(imageUrl && { imageUrl }),
      ...diagnosisFields,
    },
  });
  return NextResponse.json(plant);
}
