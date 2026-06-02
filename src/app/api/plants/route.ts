import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const plants = await prisma.plant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plants);
}

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  const data = await request.json();
  const { imageData, ...plantData } = data;
  
  let imageUrl = null;
  if (imageData) {
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }
  }

  const plant = await prisma.plant.create({
    data: {
      ...plantData,
      ...(imageUrl && { imageUrl }),
    },
  });
  return NextResponse.json(plant);
}
