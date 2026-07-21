import { prisma } from './prisma';

const CATEGORY_ALIASES: Record<string, string> = {
  catering: 'catering',
  chef: 'catering',
  chefs: 'catering',
  kitchen: 'catering',

  hospitality: 'hospitality',
  hotel: 'hospitality',
  bar: 'hospitality',
  bartending: 'hospitality',
  waiting: 'hospitality',

  production: 'production',
  factory: 'production',
  manufacturing: 'production',
  assembly: 'production',

  admin: 'office-and-admin',
  office: 'office-and-admin',
  administration: 'office-and-admin',
  clerical: 'office-and-admin',
  reception: 'office-and-admin',

  warehouse: 'warehouse',
  picker: 'warehouse',
  packer: 'warehouse',
  forklift: 'warehouse',

  retail: 'retail',
  shop: 'retail',
  sales: 'retail',
  merchandising: 'retail',

  events: 'events-and-promo',
  promo: 'events-and-promo',
  promotional: 'events-and-promo',

  driving: 'driving-and-logistics',
  logistics: 'driving-and-logistics',
  drivers: 'driving-and-logistics',
  delivery: 'driving-and-logistics',
  van: 'driving-and-logistics',
  hgv: 'driving-and-logistics',

  cleaning: 'cleaning-and-facilities',
  cleaners: 'cleaning-and-facilities',
  facilities: 'cleaning-and-facilities',
  janitorial: 'cleaning-and-facilities',

  customerservice: 'customer-service',
  callcentre: 'customer-service',
  telesales: 'customer-service',

  healthcare: 'healthcare-and-social-care',
  care: 'healthcare-and-social-care',
  homecare: 'healthcare-and-social-care',
  carer: 'healthcare-and-social-care',
  carers: 'healthcare-and-social-care',

  security: 'security',
  doorsupervisor: 'security',
  doorsupervisors: 'security',
  cctv: 'security',

  construction: 'construction-and-trades',
  trades: 'construction-and-trades',
  labourer: 'construction-and-trades',
  labourers: 'construction-and-trades',
  tradesmen: 'construction-and-trades',
  building: 'construction-and-trades',
};

const CONNECTORS = ['-staff-', '-jobs-', '-temps-', '-recruitment-', '-workers-', '-hire-'];

// Exact mapping from the old site's real "[job-title]-in-dublin" URLs to the
// closest current category. Sourced directly from the old site's build sheet —
// takes priority over the generic guessing logic below since it's known-accurate.
const JOB_TITLE_CATEGORY_MAP: Record<string, string> = {
  'accounts-assistant': 'office-and-admin',
  'accounts-clerk': 'office-and-admin',
  'accounts-payable': 'office-and-admin',
  'accounts-receivable': 'office-and-admin',
  'administrative-assistant': 'office-and-admin',
  administrator: 'office-and-admin',
  bookkeeper: 'office-and-admin',
  'credit-controller': 'office-and-admin',
  'customer-service': 'customer-service',
  'data-entry': 'office-and-admin',
  'executive-assistant': 'office-and-admin',
  'forklift-driver': 'warehouse',
  'inside-sales': 'retail',
  logistics: 'driving-and-logistics',
  'marketing-assistant': 'retail',
  'office-assistant': 'office-and-admin',
  'office-general': 'office-and-admin',
  'office-manager': 'office-and-admin',
  payroll: 'office-and-admin',
  receptionist: 'office-and-admin',
  'sales-representative': 'retail',
  secretary: 'office-and-admin',
  'technical-support': 'customer-service',
  'visual-merchandiser': 'retail',
  'warehouse-operative': 'warehouse',
  'warehouse-worker': 'warehouse',
  accountant: 'office-and-admin',
};

const DUBLIN_SUFFIXES = ['-in-dublin', '-in-co-dublin'];

function resolveJobTitleUrl(normalized: string): string | null {
  for (const suffix of DUBLIN_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      const jobTitle = normalized.slice(0, -suffix.length);
      const categorySlug = JOB_TITLE_CATEGORY_MAP[jobTitle];
      if (categorySlug) return `/category/${categorySlug}`;
    }
  }
  return null;
}

function resolveCategorySlug(token: string): string | null {
  const key = token.replace(/-/g, '');
  return CATEGORY_ALIASES[key] || null;
}

async function tryResolveParts(part1: string, part2: string): Promise<string | null> {
  const cat1 = resolveCategorySlug(part1);
  const cat2 = resolveCategorySlug(part2);
  const [area1, area2] = await Promise.all([
    prisma.area.findUnique({ where: { slug: part1 } }),
    prisma.area.findUnique({ where: { slug: part2 } }),
  ]);

  const categorySlug = cat1 || cat2;
  const areaSlug = area1?.slug || area2?.slug;

  if (categorySlug && areaSlug) return `/area/${areaSlug}/${categorySlug}`;
  if (areaSlug) return `/area/${areaSlug}`;
  if (categorySlug) return `/category/${categorySlug}`;
  return null;
}

export async function resolveLegacyUrl(slug: string): Promise<string | null> {
  const normalized = slug.toLowerCase();

  const jobTitleMatch = resolveJobTitleUrl(normalized);
  if (jobTitleMatch) return jobTitleMatch;

  for (const connector of CONNECTORS) {
    const idx = normalized.indexOf(connector);
    if (idx === -1) continue;

    const part1 = normalized.slice(0, idx);
    const part2 = normalized.slice(idx + connector.length);

    const resolved = await tryResolveParts(part1, part2);
    if (resolved) return resolved;
  }

  return null;
}
