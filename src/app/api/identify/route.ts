import { NextResponse } from "next/server";
import { identifyPlant } from "@/lib/gemini";
import { requireHouseholdData } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image") as File;
  if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  const buffer = await image.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = image.type;

  try {
    const household = await requireHouseholdData();
    const result = await identifyPlant(base64, mimeType, household.hardinessZone);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
