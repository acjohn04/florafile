import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
