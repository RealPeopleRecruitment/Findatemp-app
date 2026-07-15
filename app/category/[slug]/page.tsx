import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getApprovedTemps, getAreasWithCounts, getCategoryBySlug } from '@/lib/data';
import TempCard from '@/components/TempCard';
import FilterBar from '@/components/FilterBar';

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};

  const title = `${category.name} Temp Staff in Dublin — Available Now`;
  const description =
    category.description ||
    `Browse available ${category.name.toLowerCase()} temp staff across Dublin. Vetted candidates, request an interview or trial with as little as 1 day's notice.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { area?: string; maxRate?: string; drives?: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const [areas, temps] = await Promise.all([
    getAreasWithCounts(),
    getApprovedTemps({
      categorySlug: params.slug,
      areaSlug: searchParams.area,
      maxRate: searchParams.maxRate ? parseFloat(searchParams.maxRate) : undefined,
      drivesOnly: searchParams.drives === 'true',
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{category.name} Temp Staff in Dublin</h1>
      <p className="text-gray-600 mb-6">
        {temps.length} {category.name.toLowerCase()} temp{temps.length === 1 ? '' : 's'} currently available across Dublin.
      </p>

      <FilterBar areas={areas} categories={[]} hideCategoryFilter />

      {temps.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          No {category.name.toLowerCase()} temps match those filters right now — try widening your search.
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
