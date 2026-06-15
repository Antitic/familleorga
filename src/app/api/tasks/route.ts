import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { familyId: session.user.familyId },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, points, priority, recurring, dueDate, assignedToId } = body;

  if (!title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || "",
      points: points || 1,
      priority: priority || "MEDIUM",
      recurring: recurring || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedToId: assignedToId || null,
      createdById: session.user.id,
      familyId: session.user.familyId,
    },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
