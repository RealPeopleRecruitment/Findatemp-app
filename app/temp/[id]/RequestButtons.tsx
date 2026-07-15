'use client';

import { useState } from 'react';

type RequestType = 'CV' | 'INTERVIEW' | 'TRIAL';

const OPTIONS: { type: RequestType; label: string; blurb: string }[] = [
  { type: 'CV', label: 'Request Full CV', blurb: "We'll ask for their OK before sharing it." },
  { type: 'INTERVIEW', label: 'Request an Interview', blurb: "We'll arrange a time that suits everyone." },
  { type: 'TRIAL', label: 'Request a Temporary Trial', blurb: 'Try them out on the job before committing.' },
];

export default function RequestButtons({ tempId, tempFirstName }: { tempId: string; tempFirstName: string }) {
  const [activeType, setActiveType] = useState<RequestType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      tempId,
      type: activeType,
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Something went wrong. Please try again.');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card bg-green-50 border-green-200 text-green-800">
        <p className="font-semibold mb-1">Request sent!</p>
        <p className="text-sm">We&apos;ll be in touch shortly to follow up on {tempFirstName}&apos;s availability.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setActiveType(opt.type)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              activeType === opt.type ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-brand'
            }`}
          >
            <p className="font-semibold text-sm">{opt.label}</p>
            <p className="text-xs text-gray-500 mt-1">{opt.blurb}</p>
          </button>
        ))}
      </div>

      {activeType && (
        <form onSubmit={handleSubmit} className="card mt-4 space-y-4">
          <h3 className="font-semibold">
            {OPTIONS.find((o) => o.type === activeType)?.label} — {tempFirstName}
          </h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="companyName" placeholder="Company Name *" required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input name="contactName" placeholder="Your Name *" required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="Email *" required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input name="phone" type="tel" placeholder="Phone *" required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <textarea name="message" placeholder="Anything else we should know? (optional)" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
            <button type="button" onClick={() => setActiveType(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
