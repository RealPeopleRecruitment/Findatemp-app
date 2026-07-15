'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Area = { id: string; name: string };
type Category = { id: string; name: string };

export default function RegisterForm({
  areas,
  categories,
}: {
  areas: Area[];
  categories: Category[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      router.push('/register/thank-you');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name *</label>
          <input id="fullName" name="fullName" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone *</label>
          <input id="phone" name="phone" type="tel" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
        <input id="email" name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="areaId" className="block text-sm font-medium mb-1">Your Area *</label>
          <select id="areaId" name="areaId" required className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Select an area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-6 md:mt-7">
          <input id="drives" name="drives" type="checkbox" value="true" className="w-4 h-4" />
          <label htmlFor="drives" className="text-sm font-medium">I drive / have my own transport</label>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium mb-2">What kind of work are you looking for? *</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="categoryIds" value={cat.id} className="w-4 h-4" />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="payMin" className="block text-sm font-medium mb-1">Min Rate (€/hr) *</label>
          <input id="payMin" name="payMin" type="number" step="0.5" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label htmlFor="payMax" className="block text-sm font-medium mb-1">Max Rate (€/hr) *</label>
          <input id="payMax" name="payMax" type="number" step="0.5" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="block text-sm font-medium">Tell us about your experience — 3 short points *</p>
        <input name="bullet1" type="text" required placeholder="e.g. 3 years' experience in busy Dublin city centre restaurants" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input name="bullet2" type="text" required placeholder="e.g. Comfortable working fast-paced shifts, front or back of house" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input name="bullet3" type="text" required placeholder="e.g. Available mornings, evenings and weekends" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium mb-1">Upload your CV (PDF or Word) *</label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          onChange={(e) => setCvFileName(e.target.files?.[0]?.name ?? null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-light file:text-brand-dark file:font-medium"
        />
        {cvFileName && <p className="text-xs text-gray-500 mt-1">Selected: {cvFileName}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Your CV is never shown publicly — it's only shared with a company after you give us the go-ahead.
        </p>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? 'Submitting…' : 'Submit Registration'}
      </button>
    </form>
  );
}
