import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { familyId: session.user.familyId },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, date, endDate, color } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Titre et date requis" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || "",
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      color: color || "#3B82F6",
      createdById: session.user.id,
      familyId: session.user.familyId,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(event, { status: 201 });
}
