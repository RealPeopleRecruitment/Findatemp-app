import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  robots: { index: false },
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-gray-700 mb-4">
        [Placeholder — replace with your solicitor-reviewed Cookie Policy before launch.]
      </p>
      <p className="text-gray-700">
        At the time of writing, this site uses only a strictly necessary cookie to remember your
        cookie consent choice — no analytics or tracking cookies are set.
      </p>
    </div>
  );
}
