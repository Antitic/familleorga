import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const family = await prisma.family.create({
    data: { name: "Ma Famille" },
  });

  const adminPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@familia.fr",
      password: adminPassword,
      role: "ADMIN",
      avatar: "👨",
      familyId: family.id,
    },
  });

  console.log("Seed terminé !");
  console.log("Compte admin: admin@familia.fr / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
