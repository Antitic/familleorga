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

  if (body.name !== undefined) data.name = body.name;
  if (body.quantity !== undefined) data.quantity = body.quantity;
  if (body.category !== undefined) data.category = body.category;
  if (body.checked !== undefined) data.checked = body.checked;

  const item = await prisma.shoppingItem.update({
    where: { id: params.id },
    data,
    include: {
      addedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.shoppingItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
