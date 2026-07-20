import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getApprovedTemps,
  getAreaBySlug,
  getCategoryBySlug,
  getAreaCategoryCombosWithCounts,
  MIN_TEMPS_FOR_INDEX,
} from '@/lib/data';
import TempCard from '@/components/TempCard';

export const revalidate = 60;

export async function generateStaticParams() {
  const combos = await getAreaCategoryCombosWithCounts();
  return combos.map((c) => ({ slug: c.areaSlug, category: c.categorySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; category: string };
}): Promise<Metadata> {
  const [area, category] = await Promise.all([
    getAreaBySlug(params.slug),
    getCategoryBySlug(params.category),
  ]);
  if (!area || !category) return {};

  const temps = await getApprovedTemps({ areaSlug: params.slug, categorySlug: params.category });

  const title = `${category.name} Temp Staff in ${area.name} — Available Now`;
  const description = `Browse available ${category.name.toLowerCase()} temp staff in ${area.name}. Vetted candidates, request an interview or trial with as little as 1 day's notice.`;

  return {
    title,
    description,
    alternates: { canonical: `/area/${area.slug}/${category.slug}` },
    openGraph: { title, description },
    robots: temps.length < MIN_TEMPS_FOR_INDEX ? { index: false, follow: true } : undefined,
  };
}

export default async function AreaCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; category: string };
  searchParams: { maxRate?: string; drives?: string };
}) {
  const [area, category] = await Promise.all([
    getAreaBySlug(params.slug),
    getCategoryBySlug(params.category),
  ]);
  if (!area || !category) notFound();

  const temps = await getApprovedTemps({
    areaSlug: params.slug,
    categorySlug: params.category,
    maxRate: searchParams.maxRate ? parseFloat(searchParams.maxRate) : undefined,
    drivesOnly: searchParams.drives === 'true',
  });

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

      <p className="text-sm text-gray-500 mb-2">
        <Link href={`/area/${area.slug}`} className="hover:text-brand">{area.name}</Link>
        {' › '}
        <Link href={`/category/${category.slug}`} className="hover:text-brand">{category.name}</Link>
      </p>
      <h1 className="text-3xl font-bold mb-2">{category.name} Temp Staff in {area.name}</h1>
      <p className="text-gray-600 mb-8">
        {temps.length} {category.name.toLowerCase()} temp{temps.length === 1 ? '' : 's'} currently available in {area.name}.
      </p>

      {temps.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          No {category.name.toLowerCase()} temps in {area.name} right now — try{' '}
          <Link href={`/category/${category.slug}`} className="text-brand underline">
            browsing all {category.name.toLowerCase()} temps
          </Link>
          , or <Link href="/contact" className="text-brand underline">get in touch</Link> and we&apos;ll source someone for you.
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
