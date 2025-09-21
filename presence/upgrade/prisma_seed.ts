import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.appUser.upsert({
    where: { handle: "demo" },
    update: {},
    create: { handle: "demo" }
  });
  console.log("seeded", user.handle);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
