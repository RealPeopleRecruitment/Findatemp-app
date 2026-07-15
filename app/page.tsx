import Link from 'next/link';
import { getCategoriesWithCounts, getAreasWithCounts } from '@/lib/data';

export default async function HomePage() {
  const [categories, areas] = await Promise.all([
    getCategoriesWithCounts(),
    getAreasWithCounts(),
  ]);

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">
          Find Available Temp Staff in Dublin — Today
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Browse vetted temps across catering, hospitality, warehouse, office and more.
          Request an interview or a temporary trial with as little as 1 day&apos;s notice.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/browse" className="btn-primary">Browse Available Temps</Link>
          <Link href="/register" className="btn-secondary">Register as a Temp</Link>
        </div>
      </section>

      <section id="categories" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="card flex items-center justify-between"
            >
              <span className="font-medium">{cat.name}</span>
              <span className="text-sm text-gray-400">{cat._count.temps}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="areas" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse Temp Staff by Dublin Area</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/area/${area.slug}`}
              className="card flex items-center justify-between"
            >
              <span className="font-medium">{area.name}</span>
              <span className="text-sm text-gray-400">{area._count.temps}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold mb-2">1. Browse</h3>
              <p className="text-gray-600 text-sm">
                Search available temps by area and category — see rate, availability, and experience.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📩</div>
              <h3 className="font-semibold mb-2">2. Request</h3>
              <p className="text-gray-600 text-sm">
                Request a CV, an interview, or a temporary trial — we handle the introduction.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">3. Hire</h3>
              <p className="text-gray-600 text-sm">
                We arrange interviews, offer letters, and payroll — registration, payslips, tax, references.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
