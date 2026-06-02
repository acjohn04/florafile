import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, room, imageData } = body;
    
    let imageUrl;
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

    const plant = await prisma.plant.update({
      where: { id },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(room !== undefined && { room }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(plant);
  } catch (error) {
    console.error("Failed to update plant:", error);
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 });
  }
}

