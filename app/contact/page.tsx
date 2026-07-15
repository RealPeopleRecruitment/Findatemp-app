import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Find A Temp to source temporary staff across Dublin.',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Get In Touch</h1>
      <div className="card space-y-3">
        <p><strong>Phone:</strong> +353 (0)1 254 4273</p>
        <p><strong>Email:</strong> gerard@findatemp.ie</p>
        <p><strong>Address:</strong> The Brickhouse, Block 1, Mount Street Lower, Dublin 2</p>
      </div>
      <p className="text-gray-600 mt-6">
        Looking for temp staff? The fastest way to reach us is to{' '}
        <a href="/browse" className="text-brand underline">browse available temps</a> and request an
        interview or trial directly from a profile.
      </p>
    </div>
  );
}
