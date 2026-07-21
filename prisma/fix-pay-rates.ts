import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MINIMUM_WAGE = 14.15;

async function main() {
  const allTemps = await prisma.temp.findMany({
    select: { id: true, fullName: true, payMin: true, payMax: true },
  });

  const belowFloor = allTemps.filter((t) => Number(t.payMin) < MINIMUM_WAGE);

  console.log(`Found ${belowFloor.length} of ${allTemps.length} profiles below €${MINIMUM_WAGE}/hr.`);

  let updated = 0;
  for (const temp of belowFloor) {
    const oldMin = Number(temp.payMin);
    const oldMax = Number(temp.payMax);
    const delta = MINIMUM_WAGE - oldMin;
    const newMin = MINIMUM_WAGE;
    const newMax = Math.max(MINIMUM_WAGE, oldMax + delta);

    await prisma.temp.update({
      where: { id: temp.id },
      data: { payMin: newMin, payMax: newMax },
    });
    updated++;
  }

  console.log(`Updated ${updated} profiles to meet the €${MINIMUM_WAGE}/hr National Minimum Wage floor.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
