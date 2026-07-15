/**
 * Bulk import script for your existing temp dataset.
 *
 * USAGE:
 * 1. Export/save your dataset as prisma/data/temps-import.csv with these columns
 *    (header row required, exact names):
 *      fullName, email, phone, area, categories, payMin, payMax, drives, bullet1, bullet2, bullet3, cvUrl
 *
 *    - area          : must match an existing Area name (e.g. "Dublin 2") — run `npm run db:seed` first
 *    - categories     : comma-separated category names (e.g. "Catering,Hospitality")
 *    - drives         : "true" or "false"
 *    - cvUrl          : a URL to the CV file. If you don't have CVs hosted anywhere yet, leave blank —
 *                        imported temps will need a CV uploaded before they can be approved.
 *
 * 2. Run: npm run db:import
 *
 * All imported temps are created with status APPROVED by default (see APPROVE_ON_IMPORT below) —
 * change to PENDING if you'd rather review each one first.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const APPROVE_ON_IMPORT = true;

type CsvRow = {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  categories: string;
  payMin: string;
  payMax: string;
  drives: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  cvUrl: string;
};

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Basic CSV split — for fields containing commas, wrap them in "quotes" in the source file.
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row as CsvRow;
  });
}

async function main() {
  const filePath = path.join(__dirname, 'data', 'temps-import.csv');
  if (!fs.existsSync(filePath)) {
    console.error(`No file found at ${filePath}. Create it first — see instructions at the top of this script.`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(filePath, 'utf-8'));
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const area = await prisma.area.findUnique({ where: { name: row.area.trim() } });
    if (!area) {
      console.warn(`Skipping ${row.fullName} — unknown area "${row.area}"`);
      skipped++;
      continue;
    }

    const categoryNames = row.categories.split(',').map((c) => c.trim()).filter(Boolean);
    const categories = await prisma.category.findMany({ where: { name: { in: categoryNames } } });
    if (categories.length === 0) {
      console.warn(`Skipping ${row.fullName} — no matching categories for "${row.categories}"`);
      skipped++;
      continue;
    }

    await prisma.temp.create({
      data: {
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        areaId: area.id,
        payMin: parseFloat(row.payMin) || 0,
        payMax: parseFloat(row.payMax) || 0,
        drives: row.drives?.toLowerCase() === 'true',
        bullet1: row.bullet1 || '',
        bullet2: row.bullet2 || '',
        bullet3: row.bullet3 || '',
        cvUrl: row.cvUrl || '',
        status: APPROVE_ON_IMPORT ? 'APPROVED' : 'PENDING',
        categories: {
          create: categories.map((c) => ({ categoryId: c.id })),
        },
      },
    });
    created++;
  }

  console.log(`Imported ${created} temps. Skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
