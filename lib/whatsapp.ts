const DEFAULT_NUMBER = '353892556485';

export function getWhatsAppLink(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
