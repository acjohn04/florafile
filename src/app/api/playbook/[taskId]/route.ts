import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const body = await request.json();
  
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { completed: body.completed },
  });
  
  return NextResponse.json(updatedTask);
}
