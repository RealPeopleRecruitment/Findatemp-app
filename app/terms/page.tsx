import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="text-gray-700 mb-4">
        [Placeholder — replace with your solicitor-reviewed Terms and Conditions before launch.]
      </p>
      <p className="text-gray-700">
        These terms will cover use of the site by both temps registering for work and companies
        requesting staff, including acceptable use, liability, and any placement fees.
      </p>
    </div>
  );
}
