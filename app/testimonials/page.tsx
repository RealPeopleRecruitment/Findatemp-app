import type { Metadata } from 'next';
import Link from 'next/link';
import TestimonialCard from '@/components/TestimonialCard';
import { testimonials } from '@/lib/testimonials';

export const metadata: Metadata = {
  title: 'Testimonials',
  description:
    'What Dublin employers and temps say about Find A Temp: fast, vetted temporary staff with as little as 1 day\'s notice.',
  alternates: { canonical: '/testimonials' },
};

export default function TestimonialsPage() {
  const employers = testimonials.filter((t) => t.type === 'employer');
  const temps = testimonials.filter((t) => t.type === 'temp');

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">What People Say About Find A Temp</h1>
      <p className="text-gray-600 max-w-2xl mb-12">
        Feedback from Dublin companies who have hired through Find A Temp, and from the temps we
        have placed.
      </p>

      {testimonials.length === 0 && (
        <p className="text-gray-500">Testimonials are coming soon.</p>
      )}

      {employers.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">From Employers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employers.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </section>
      )}

      {temps.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">From Our Temps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temps.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </section>
      )}

      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-3">Need temp staff in Dublin?</h2>
        <p className="text-gray-600 mb-6">
          Browse vetted temps available now and request an interview or trial.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/browse" className="btn-primary">Browse Available Temps</Link>
          <Link href="/register" className="btn-secondary">Register as a Temp</Link>
        </div>
      </div>
    </div>
  );
}
