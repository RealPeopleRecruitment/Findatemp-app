import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const latest = await prisma.verificationCode.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log(latest);
  await prisma.$disconnect();
}

main();
