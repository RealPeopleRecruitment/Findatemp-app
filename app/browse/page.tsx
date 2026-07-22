import type { Metadata } from 'next';
import { getApprovedTemps, getAreasWithCounts, getCategoriesWithCounts } from '@/lib/data';
import TempCard from '@/components/TempCard';
import FilterBar from '@/components/FilterBar';

export const metadata: Metadata = {
  title: 'Browse Available Temp Staff in Dublin',
  description:
    'Search all available temp staff in Dublin by area, category, rate, and driver status. Request an interview or trial today.',
};

export const revalidate = 3600;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { area?: string; category?: string; maxRate?: string; drives?: string };
}) {
  const [areas, categories, temps] = await Promise.all([
    getAreasWithCounts(),
    getCategoriesWithCounts(),
    getApprovedTemps({
      areaSlug: searchParams.area,
      categorySlug: searchParams.category,
      maxRate: searchParams.maxRate ? parseFloat(searchParams.maxRate) : undefined,
      drivesOnly: searchParams.drives === 'true',
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Browse Available Temp Staff</h1>
      <p className="text-gray-600 mb-6">{temps.length} temp{temps.length === 1 ? '' : 's'} available</p>

      <FilterBar areas={areas} categories={categories} />

      {temps.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          No temps match those filters right now — try widening your search.
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
