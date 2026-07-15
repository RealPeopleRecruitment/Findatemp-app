import { prisma } from './prisma';

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { temps: { where: { temp: { status: 'APPROVED' } } } },
      },
    },
  });
  return categories;
}

export async function getAreasWithCounts() {
  const areas = await prisma.area.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { temps: { where: { status: 'APPROVED' } } },
      },
    },
  });
  return areas;
}

export async function getApprovedTemps(filters: {
  areaSlug?: string;
  categorySlug?: string;
  maxRate?: number;
  drivesOnly?: boolean;
}) {
  return prisma.temp.findMany({
    where: {
      status: 'APPROVED',
      area: filters.areaSlug ? { slug: filters.areaSlug } : undefined,
      categories: filters.categorySlug
        ? { some: { category: { slug: filters.categorySlug } } }
        : undefined,
      payMin: filters.maxRate ? { lte: filters.maxRate } : undefined,
      drives: filters.drivesOnly ? true : undefined,
    },
    include: {
      area: true,
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTempById(id: string) {
  return prisma.temp.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      area: true,
      categories: { include: { category: true } },
    },
  });
}

export async function getAreaBySlug(slug: string) {
  return prisma.area.findUnique({ where: { slug } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
