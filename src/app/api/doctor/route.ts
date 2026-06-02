import { NextResponse } from "next/server";
import { diagnosePlant } from "@/lib/gemini";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image") as File;
  const plantId = formData.get("plantId") as string | null;

  if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  const buffer = await image.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = image.type;

  try {
    const result = await diagnosePlant(base64, mimeType);
    
    // Save to database
    const diagnosis = await prisma.diagnosis.create({
      data: {
        plantId,
        diagnosisName: result.diagnosisName,
        severity: result.severity,
        description: result.description,
        recoverySteps: JSON.stringify(result.recoverySteps),
      }
    });

    return NextResponse.json({ diagnosis, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
