import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getApprovedTemps, getAreaBySlug, getCategoriesWithCounts, getAreaCategoryCombosWithCounts } from '@/lib/data';
import TempCard from '@/components/TempCard';
import FilterBar from '@/components/FilterBar';
import ComboFilterToggle from '@/components/ComboFilterToggle';

export const revalidate = 3600;

export async function generateStaticParams() {
  const areas = await prisma.area.findMany({ select: { slug: true } });
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const area = await getAreaBySlug(params.slug);
  if (!area) return {};

  const title = `Temp Staff in ${area.name} — Available Now`;
  const description = `Find available temp staff in ${area.name}. Browse vetted, ready-to-work candidates across catering, hospitality, warehouse, office and more — no agency fees to search.`;

  return {
    title,
    description,
    alternates: { canonical: `/area/${area.slug}` },
    openGraph: { title, description },
  };
}

export default async function AreaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { category?: string; maxRate?: string; drives?: string };
}) {
  const area = await getAreaBySlug(params.slug);
  if (!area) notFound();

  const [categories, temps, allCombos] = await Promise.all([
    getCategoriesWithCounts(),
    getApprovedTemps({
      areaSlug: params.slug,
      categorySlug: searchParams.category,
      maxRate: searchParams.maxRate ? parseFloat(searchParams.maxRate) : undefined,
      drivesOnly: searchParams.drives === 'true',
    }),
    getAreaCategoryCombosWithCounts(),
  ]);

  const comboLinksForThisArea = allCombos.filter((c) => c.areaSlug === params.slug);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: temps.map((temp, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.findatemp.ie/temp/${temp.id}`,
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <h1 className="text-3xl font-bold mb-2">Temp Staff in {area.name}</h1>
      <p className="text-gray-600 mb-6">
        {temps.length} temp{temps.length === 1 ? '' : 's'} currently available in {area.name}.
      </p>

      <ComboFilterToggle
        toggleLabel="Filter by category"
        links={comboLinksForThisArea.map((c) => ({
          key: c.categorySlug,
          href: `/area/${area.slug}/${c.categorySlug}`,
          label: `${c.categoryName} (${c.count})`,
        }))}
      />

      <FilterBar areas={[]} categories={categories} hideAreaFilter />

      {temps.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          No temps match those filters in {area.name} right now — try widening your search, or{' '}
          <a href="/contact" className="text-brand underline">get in touch</a> and we&apos;ll source someone for you.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {temps.map((temp) => (
            <TempCard
              key={temp.id}
              id={temp.id}
              fullName={temp.fullName}
              areaName={temp.area.name}
              categoryNames={temp.categories.map((c) => c.category.name)}
              payMin={Number(temp.payMin)}
              payMax={Number(temp.payMax)}
              drives={temp.drives}
              bullet1={temp.bullet1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
