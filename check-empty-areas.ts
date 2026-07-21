import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const areas = await prisma.area.findMany({
    include: { _count: { select: { temps: { where: { status: 'APPROVED' } } } } },
    orderBy: { name: 'asc' },
  });

  const empty = areas.filter((a) => a._count.temps === 0);
  const populated = areas.filter((a) => a._count.temps > 0);

  console.log(`\n${empty.length} areas with ZERO approved temps:`);
  empty.forEach((a) => console.log(`  - ${a.name}`));

  console.log(`\n${populated.length} areas with at least 1 approved temp.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
