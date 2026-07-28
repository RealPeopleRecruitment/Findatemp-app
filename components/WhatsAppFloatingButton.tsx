import { getWhatsAppLink } from '@/lib/whatsapp';

export default function WhatsAppFloatingButton() {
  const link = getWhatsAppLink(
    "Hi, I need temp staff urgently (via findatemp.ie) — can we talk on WhatsApp?"
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-6 z-40 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.86 14.01c-.25.7-1.23 1.29-1.99 1.44-.53.11-1.22.19-3.54-.76-2.97-1.23-4.88-4.24-5.03-4.44-.15-.2-1.2-1.6-1.2-3.05s.75-2.16 1.02-2.46c.25-.28.54-.35.72-.35.18 0 .36.002.51.01.17.007.39-.06.61.46.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.09.18-.14.29-.27.44-.14.16-.28.35-.4.47-.13.13-.27.27-.12.53.15.26.68 1.12 1.46 1.82 1 .89 1.84 1.17 2.11 1.3.27.13.42.11.58-.07.16-.18.68-.79.87-1.06.18-.27.36-.22.61-.13.25.09 1.58.75 1.85.88.27.13.45.2.51.31.07.11.07.65-.18 1.35z"/>
      </svg>
    </a>
  );
}
