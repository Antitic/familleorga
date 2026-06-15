import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const items = await prisma.shoppingItem.findMany({
    where: { familyId: session.user.familyId },
    include: {
      addedBy: { select: { id: true, name: true } },
    },
    orderBy: [{ checked: "asc" }, { category: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { name, quantity, category } = body;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const item = await prisma.shoppingItem.create({
    data: {
      name,
      quantity: quantity || "1",
      category: category || "Autre",
      addedById: session.user.id,
      familyId: session.user.familyId,
    },
    include: {
      addedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(item, { status: 201 });
}
