import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";
import { diagnosePlant } from "@/lib/gemini";
import { uploadImage, buildProfileKey, parseDataUrl } from "@/lib/storage";

export async function GET() {
  const householdId = await requireHousehold();
  const plants = await prisma.plant.findMany({
    where: { householdId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plants);
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
  try {
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
      // Parse the data URL into raw bytes and metadata
      const parsed = parseDataUrl(imageData);
      if (parsed) {
        try {
          // Upload the image to the Railway S3 bucket.
          // We use a temporary ID since the plant doesn't exist yet;
          // the key includes a UUID so it's unique regardless.
          const key = buildProfileKey("new", parsed.ext);
          imageUrl = await uploadImage(parsed.buffer, key, parsed.mimeType);
        } catch (uploadError) {
          // Non-fatal — plant saves without an image if the bucket is unreachable
          console.error("Image upload failed, saving plant without image:", uploadError);
        }

        // Run AI health check on the uploaded image regardless of upload result
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
  } catch (error) {
    console.error("Failed to create plant:", error);
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 });
  }
}
