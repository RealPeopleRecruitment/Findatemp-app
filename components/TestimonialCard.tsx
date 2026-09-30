import type { Testimonial } from '@/lib/testimonials';

export default function TestimonialCard({ t }: { t: Testimonial }) {
  const byline = [t.role, t.company].filter(Boolean).join(', ');
  return (
    <figure className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col h-full">
      <span className="tag self-start mb-4">{t.type === 'employer' ? 'Employer' : 'Temp'}</span>
      <blockquote className="text-gray-800 leading-relaxed flex-1">
        <span className="text-brand text-3xl leading-none font-serif mr-1" aria-hidden="true">&ldquo;</span>
        {t.quote}
      </blockquote>
      <figcaption className="mt-5 text-sm">
        <span className="font-semibold">{t.name}</span>
        {byline && <span className="block text-gray-500">{byline}</span>}
      </figcaption>
    </figure>
  );
}
