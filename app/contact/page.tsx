import type { Metadata } from 'next';
import { getWhatsAppLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Find A Temp to source temporary staff across Dublin.',
};

export default function ContactPage() {
  const whatsappLink = getWhatsAppLink(
    "Hi, I'd like to talk to Find A Temp about hiring temp staff (via findatemp.ie)."
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Get In Touch</h1>
      <div className="card space-y-3">
        <p><strong>Phone:</strong> +353 (0)1 254 4273</p>
        <p><strong>Email:</strong> gerard@findatemp.ie</p>
        <p><strong>Address:</strong> The Brickhouse, Block 1, Mount Street Lower, Dublin 2</p>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        Chat with us on WhatsApp
      </a>

      <p className="text-gray-600 mt-6">
        Looking for temp staff? The fastest way to reach us is to{' '}
        <a href="/browse" className="text-brand underline">browse available temps</a> and request an
        interview or trial directly from a profile.
      </p>
    </div>
  );
}


