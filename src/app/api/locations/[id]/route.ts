import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const householdId = await requireHousehold();
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid location name", { status: 400 });
    }

    // Verify ownership
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location || location.householdId !== householdId) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Prevent duplicates for the same household
    const existing = await prisma.location.findFirst({
      where: {
        householdId,
        name: name.trim(),
        id: { not: id },
      },
    });

    if (existing) {
      return new NextResponse("Location already exists", { status: 400 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedLocation);
  } catch (error: unknown) {
    console.error("[Location PUT]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const householdId = await requireHousehold();

    // Verify ownership
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location || location.householdId !== householdId) {
      return new NextResponse("Not found", { status: 404 });
    }

    await prisma.location.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[Location DELETE]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
