import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { familyId: session.user.familyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      points: true,
      createdAt: true,
    },
    orderBy: { points: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, role, avatar } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "MEMBER",
      avatar: avatar || "👤",
      familyId: session.user.familyId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      points: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
