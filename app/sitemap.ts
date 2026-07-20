import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAreaCategoryCombosWithCounts, MIN_TEMPS_FOR_INDEX } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [areas, categories, temps, combos] = await Promise.all([
    prisma.area.findMany({ select: { slug: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.temp.findMany({ where: { status: 'APPROVED' }, select: { id: true, updatedAt: true } }),
    getAreaCategoryCombosWithCounts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://www.findatemp.ie', priority: 1 },
    { url: 'https://www.findatemp.ie/browse', priority: 0.9 },
    { url: 'https://www.findatemp.ie/register', priority: 0.7 },
    { url: 'https://www.findatemp.ie/about', priority: 0.5 },
    { url: 'https://www.findatemp.ie/contact', priority: 0.5 },
  ];

  const areaPages: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `https://www.findatemp.ie/area/${a.slug}`,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `https://www.findatemp.ie/category/${c.slug}`,
    priority: 0.8,
  }));

  const comboPages: MetadataRoute.Sitemap = combos
    .filter((c) => c.count >= MIN_TEMPS_FOR_INDEX)
    .map((c) => ({
      url: `https://www.findatemp.ie/area/${c.areaSlug}/${c.categorySlug}`,
      priority: 0.85,
    }));

  const tempPages: MetadataRoute.Sitemap = temps.map((t) => ({
    url: `https://www.findatemp.ie/temp/${t.id}`,
    lastModified: t.updatedAt,
    priority: 0.6,
  }));

  return [...staticPages, ...areaPages, ...categoryPages, ...comboPages, ...tempPages];
}
