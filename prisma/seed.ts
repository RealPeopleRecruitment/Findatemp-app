import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const AREAS = [
  'Dublin 1', 'Dublin 2', 'Dublin 3', 'Dublin 4', 'Dublin 5', 'Dublin 6',
  'Dublin 6W', 'Dublin 7', 'Dublin 8', 'Dublin 9', 'Dublin 10', 'Dublin 11',
  'Dublin 12', 'Dublin 13', 'Dublin 14', 'Dublin 15', 'Dublin 16', 'Dublin 17',
  'Dublin 18', 'Dublin 20', 'Dublin 22', 'Dublin 24',
  'North County Dublin', 'South County Dublin', 'Dun Laoghaire',
  'Artane', 'Ballsbridge', 'Ballyfermot', 'Ballymun', 'Blackrock', 'Blanchardstown',
  'Cabra', 'Castleknock', 'Celbridge', 'Chapelizod', 'Clondalkin', 'Clonskeagh',
  'Clontarf', 'Coolock', 'Crumlin', 'Dalkey', 'Donnybrook', 'Drumcondra', 'Dundrum',
  'Finglas', 'Firhouse', 'Foxrock', 'Glasnevin', "Harold's Cross", 'Howth', 'Inchicore',
  'Kilbarrack', 'Killester', 'Killiney', 'Kimmage', 'Knocklyon', 'Leixlip', 'Lucan',
  'Malahide', 'Maynooth', 'Monkstown', 'Palmerstown', 'Phibsborough', 'Portmarnock',
  'Raheny', 'Ranelagh', 'Rathfarnham', 'Rathgar', 'Rathmines', 'Ringsend', 'Sandyford',
  'Sandymount', 'Santry', 'Stillorgan', 'Sutton', 'Swords', 'Tallaght', 'Templeogue',
'Terenure', 'Walkinstown', 'Whitehall',
  'Skerries', 'Balbriggan', 'Rush', 'Lusk', 'Donabate',
'Marino', 'Fairview', 'Beaumont', 'Edenmore', 'Kilmore', 'Baldoyle', 'Clongriffin',
  'Mulhuddart', 'Tyrrelstown', 'Ongar', 'Clonsilla', 'Stoneybatter', 'Smithfield',
  'Kilmainham', "Dolphin's Barn", 'Drimnagh', 'Perrystown', 'Ballinteer', 'Churchtown',
  'Goatstown', 'Milltown', 'Leopardstown', 'Cherrywood', 'Loughlinstown', 'Shankill',
  'Deansgrange', 'Carrickmines', 'Rathcoole', 'Saggart', 'Citywest',
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
  {
    name: 'Healthcare & Social Care',
    description: 'Home care assistants, healthcare assistants, and support workers available for temporary Dublin placements.',
  },
  {
    name: 'Security',
    description: 'Security officers, door supervisors, and CCTV operators available for temporary Dublin work.',
  },
  {
    name: 'Construction & Trades',
    description: "Labourers, carpenters, electricians' mates, painters and other trades available for temporary Dublin work.",
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
