import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        [Placeholder — replace with your full policy, ideally reviewed by a solicitor.]
      </p>
      <h2 className="text-lg font-semibold mb-2 mt-8">How we handle temp profiles</h2>
      <p className="text-gray-700 mb-4">
        Public profile pages show only first name, last initial, general location, category,
        pay range, and a brief summary of experience. Full CVs and direct contact details are
        never published or made downloadable. When a company requests a CV, an interview, or a
        trial, we contact the individual concerned for their consent before sharing any personal
        information or documents.
      </p>
    </div>
  );
}
