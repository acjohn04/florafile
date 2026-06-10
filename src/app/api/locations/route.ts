import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireHousehold } from "@/lib/auth";

export async function GET() {
  try {
    const householdId = await requireHousehold();

    const locations = await prisma.location.findMany({
      where: { householdId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(locations);
  } catch (error: unknown) {
    console.error("[Locations GET]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const householdId = await requireHousehold();
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid location name", { status: 400 });
    }

    // Prevent duplicates for the same household
    const existing = await prisma.location.findFirst({
      where: { householdId, name: name.trim() },
    });

    if (existing) {
      return new NextResponse("Location already exists", { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        householdId,
        name: name.trim(),
      },
    });

    return NextResponse.json(location);
  } catch (error: unknown) {
    console.error("[Locations POST]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
