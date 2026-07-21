/**
 * Import script for the Dublin candidates dataset (dublin_candidates1_copy.csv format).
 *
 * Expected columns (exact header): FirstName, Gender, Sector, JobTitle, Email,
 * HourlyRate, Areas, OwnTransport, Description
 *
 * USAGE:
 * 1. Place the CSV at prisma/data/<filename>.csv
 * 2. Run: npx tsx prisma/import.ts <filename>.csv
 *    (or just `npm run db:import` to use the default dublin-candidates.csv)
 *
 * Notes:
 * - "Email" in the source file is an internal reference code, not a real email —
 *   it's stored in the externalRef field only, never used as a contact email.
 * - No CV files are provided for this batch — cvUrl is left blank.
 * - All imported profiles land as PENDING for manual review.
 * - This batch is intentionally NOT synced to CATS (no real email to create a candidate with).
 * - Any rate below the National Minimum Wage is automatically raised to meet it.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const MINIMUM_WAGE = 14.15;

const JOB_TITLE_TO_CATEGORY: Record<string, string> = {
  'Customer Service Advisor': 'Customer Service',
  'Telesales Executive': 'Customer Service',
  'Call Centre Agent': 'Customer Service',
  'Customer Service Representative': 'Customer Service',

  'Door Supervisor': 'Security',
  'Security Officer': 'Security',
  'CCTV Operator': 'Security',

  'Warehouse Operative': 'Warehouse',
  'Forklift operative': 'Warehouse',
  'Dispatch Operative': 'Warehouse',
  'Stock Assistant': 'Warehouse',

  'Home Care Assistant': 'Healthcare & Social Care',
  'Care Support Worker': 'Healthcare & Social Care',
  'Healthcare Assistant': 'Healthcare & Social Care',
  'Support Worker': 'Healthcare & Social Care',

  Cashier: 'Retail',
  'Sales Assistant': 'Retail',
  'Visual Merchandiser': 'Retail',
  'Retail Supervisor': 'Retail',
  'Store Assistant': 'Retail',

  Labourer: 'Construction & Trades',
  "Electrician's Mate": 'Construction & Trades',
  Carpenter: 'Construction & Trades',
  'Painter/Decorator': 'Construction & Trades',
  Plasterer: 'Construction & Trades',
  Groundworker: 'Construction & Trades',

  'Logistics Coordinator': 'Driving & Logistics',
  'Van Driver': 'Driving & Logistics',
  'HGV Driver': 'Driving & Logistics',
  'Delivery Driver': 'Driving & Logistics',

  'Machine Operator': 'Production',
  'Quality Control Inspector': 'Production',
  'Production Operative': 'Production',
  'Assembly Line Operative': 'Production',
  'General Operative': 'Production',

  'Office Assistant': 'Office & Admin',
  'Data Entry Clerk': 'Office & Admin',
  Receptionist: 'Office & Admin',
  Administrator: 'Office & Admin',
  'Accounts Assistant': 'Office & Admin',

  'Waiter/Waitress': 'Hospitality',
  Barista: 'Hospitality',
  'Front of House Assistant': 'Hospitality',
  Bartender: 'Hospitality',

  'Commis Chef': 'Catering',
  'Kitchen Porter': 'Catering',
  'Catering Assistant': 'Catering',

  'Housekeeping Assistant': 'Cleaning & Facilities',
};

function toBullets(description: string): [string, string, string] {
  const segments = description.split(' -- ').map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 3) {
    return [segments[0] || '', segments[1] || '', segments[2] || ''];
  }
  return [segments[0], segments[1], segments.slice(2).join('. ')];
}

async function main() {
  const filename = process.argv[2] || 'dublin-candidates.csv';
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`No file found at ${filePath}. Place the CSV there first.`);
    process.exit(1);
  }

  const records: any[] = parse(fs.readFileSync(filePath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
  });

  const areaCache = new Map<string, string>();
  const categoryCache = new Map<string, string>();

  let created = 0;
  let skipped = 0;
  let raisedToFloor = 0;

  for (const row of records) {
    const areaName = (row.Areas || '').trim();
    const jobTitle = (row.JobTitle || '').trim();
    const categoryName = JOB_TITLE_TO_CATEGORY[jobTitle];

    if (!areaName || !jobTitle || !categoryName) {
      console.warn(`Skipping ${row.FirstName} — unrecognised area "${areaName}" or job title "${jobTitle}"`);
      skipped++;
      continue;
    }

    if (!areaCache.has(areaName)) {
      const area = await prisma.area.findUnique({ where: { name: areaName } });
      if (!area) {
        console.warn(`Skipping ${row.FirstName} — no Area record for "${areaName}". Run npm run db:seed first.`);
        skipped++;
        continue;
      }
      areaCache.set(areaName, area.id);
    }

    if (!categoryCache.has(categoryName)) {
      const category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        console.warn(`Skipping ${row.FirstName} — no Category record for "${categoryName}". Run npm run db:seed first.`);
        skipped++;
        continue;
      }
      categoryCache.set(categoryName, category.id);
    }

    const rawRate = parseFloat(row.HourlyRate) || 0;
    const rate = Math.max(MINIMUM_WAGE, rawRate);
    if (rawRate < MINIMUM_WAGE) raisedToFloor++;
    const [bullet1, bullet2, bullet3] = toBullets(row.Description || '');
    const drives = (row.OwnTransport || '').toLowerCase().includes('own');

    await prisma.temp.create({
      data: {
        fullName: row.FirstName || 'Unknown',
        email: null,
        phone: null,
        externalRef: row.Email || null,
        areaId: areaCache.get(areaName)!,
        payMin: rate,
        payMax: rate,
        drives,
        bullet1,
        bullet2,
        bullet3,
        cvUrl: '',
        status: 'PENDING',
        categories: {
          create: [{ categoryId: categoryCache.get(categoryName)! }],
        },
      },
    });
    created++;
  }

  console.log(`Imported ${created} candidates. Skipped ${skipped}. Raised ${raisedToFloor} rates to the €${MINIMUM_WAGE}/hr minimum.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
