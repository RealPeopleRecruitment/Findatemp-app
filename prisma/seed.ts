import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const AREAS = [
  'Dublin 1', 'Dublin 2', 'Dublin 3', 'Dublin 4', 'Dublin 5', 'Dublin 6',
  'Dublin 6W', 'Dublin 7', 'Dublin 8', 'Dublin 9', 'Dublin 10', 'Dublin 11',
  'Dublin 12', 'Dublin 13', 'Dublin 14', 'Dublin 15', 'Dublin 16', 'Dublin 17',
  'Dublin 18', 'Dublin 20', 'Dublin 22', 'Dublin 24',
  'North County Dublin', 'South County Dublin', 'Dun Laoghaire',
];

const CATEGORIES: { name: string; description: string }[] = [
  {
    name: 'Catering',
    description: 'Chefs, kitchen porters, and catering assistants available for temporary Dublin bookings.',
  },
  {
    name: 'Hospitality',
    description: 'Bar staff, waiters, and hotel staff available for temporary work across Dublin.',
  },
  {
    name: 'Production',
    description: 'Production line and manufacturing staff available for temporary Dublin placements.',
  },
  {
    name: 'Office & Admin',
    description: 'Receptionists, admin assistants, and office support staff available for temp cover in Dublin.',
  },
  {
    name: 'Warehouse',
    description: 'Warehouse operatives, pickers/packers, and forklift drivers available for temporary work in Dublin.',
  },
  {
    name: 'Retail',
    description: 'Retail assistants and sales staff available for temporary Dublin cover.',
  },
  {
    name: 'Events & Promo',
    description: 'Event crew, promotional staff, and brand ambassadors available for temporary Dublin events.',
  },
  {
    name: 'Driving & Logistics',
    description: 'Van drivers, delivery staff, and logistics support available for temporary Dublin work.',
  },
  {
    name: 'Cleaning & Facilities',
    description: 'Cleaning and facilities support staff available for temporary Dublin placements.',
  },
  {
    name: 'Customer Service',
    description: 'Call centre and customer service staff available for temporary Dublin cover.',
  },
];

async function main() {
  for (const name of AREAS) {
    const slug = slugify(name, { lower: true });
    await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }

  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name, { lower: true });
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, slug, description: cat.description },
    });
  }

  console.log(`Seeded ${AREAS.length} areas and ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
