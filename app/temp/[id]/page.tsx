import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTempById } from '@/lib/data';
import RequestButtons from './RequestButtons';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const temp = await getTempById(params.id);
  if (!temp) return {};

  const categoryNames = temp.categories.map((c) => c.category.name).join(', ');
  const title = `${categoryNames} Temp Available in ${temp.area.name}`;
  const description = `${temp.bullet1} Available for temporary work in ${temp.area.name}. Request an interview or trial today.`;

  return {
    title,
    description,
    alternates: { canonical: `/temp/${temp.id}` },
  };
}

export default async function TempProfilePage({ params }: { params: { id: string } }) {
  const temp = await getTempById(params.id);
  if (!temp) notFound();

  const displayName =
    temp.fullName.trim().split(' ').length > 1
      ? `${temp.fullName.trim().split(' ')[0]} ${temp.fullName.trim().split(' ').slice(-1)[0][0]}.`
      : temp.fullName;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: `${temp.categories.map((c) => c.category.name).join(', ')} Temp — ${temp.area.name}`,
    description: temp.bullet1,
    datePosted: temp.createdAt.toISOString(),
    employmentType: 'TEMPORARY',
    hiringOrganization: { '@type': 'Organization', name: 'Find A Temp', sameAs: 'https://www.findatemp.ie' },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: temp.area.name, addressRegion: 'Dublin', addressCountry: 'IE' },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: { '@type': 'QuantitativeValue', minValue: Number(temp.payMin), maxValue: Number(temp.payMax), unitText: 'HOUR' },
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="text-gray-500">{temp.area.name}</p>
        </div>
        {temp.drives && <span className="tag">🚗 Driver</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {temp.categories.map((c) => (
          <span key={c.category.id} className="tag">{c.category.name}</span>
        ))}
      </div>

      <p className="text-2xl font-bold text-brand mb-8">
        €{Number(temp.payMin).toFixed(2)}–€{Number(temp.payMax).toFixed(2)}/hr
      </p>

      <div className="card mb-8">
        <h2 className="font-semibold mb-3">Experience</h2>
        <ul className="space-y-2 list-disc list-inside text-gray-700">
          <li>{temp.bullet1}</li>
          <li>{temp.bullet2}</li>
          <li>{temp.bullet3}</li>
        </ul>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Full CV and direct contact details are kept private in line with GDPR — choose an option
        below and we&apos;ll follow up with {displayName.split(' ')[0]} on your behalf.
      </p>

      <RequestButtons tempId={temp.id} tempFirstName={displayName.split(' ')[0]} />
    </div>
  );
}
