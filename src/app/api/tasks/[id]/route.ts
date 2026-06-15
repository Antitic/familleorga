import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const data: any = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.points !== undefined) data.points = body.points;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.recurring !== undefined) data.recurring = body.recurring || null;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId || null;

  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "DONE") {
      data.completedAt = new Date();
      const task = await prisma.task.findUnique({ where: { id: params.id } });
      if (task?.assignedToId) {
        await prisma.user.update({
          where: { id: task.assignedToId },
          data: { points: { increment: task.points } },
        });
      }
    } else {
      data.completedAt = null;
    }
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
