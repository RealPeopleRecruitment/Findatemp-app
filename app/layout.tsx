import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.findatemp.ie'),
  title: {
    default: 'Find A Temp | Temp Staff in Dublin — Available Now',
    template: '%s | Find A Temp',
  },
  description:
    'Browse vetted temp staff available across Dublin — catering, hospitality, production, office, warehouse and more. Request an interview or trial today.',
  openGraph: {
    title: 'Find A Temp | Temp Staff in Dublin',
    description:
      'Browse vetted temp staff available across Dublin — catering, hospitality, production, office, warehouse and more.',
    url: 'https://www.findatemp.ie',
    siteName: 'Find A Temp',
    type: 'website',
    locale: 'en_IE',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE">
      <body>
        <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
<Link href="/" className="flex items-center">
  <img src="/logo.png" alt="Find A Temp" className="h-10 w-auto" />
</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/browse" className="hover:text-brand">Browse Temps</Link>
              <Link href="/#categories" className="hover:text-brand">Categories</Link>
              <Link href="/#areas" className="hover:text-brand">Dublin Areas</Link>
              <Link href="/about" className="hover:text-brand">About</Link>
              <Link href="/contact" className="hover:text-brand">Contact</Link>
            </nav>
            <Link href="/register" className="btn-primary text-sm">
              Register as a Temp
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-gray-200 mt-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-bold text-brand mb-2">FINDATEMP</p>
              <p className="text-gray-600">
                The Brickhouse, Block 1, Mount Street Lower, Dublin 2
              </p>
              <p className="text-gray-600 mt-2">+353 (0)1 254 4273</p>
              <p className="text-gray-600">gerard@findatemp.ie</p>
            </div>
            <div>
              <p className="font-semibold mb-2">For Companies</p>
              <ul className="space-y-1 text-gray-600">
                <li><Link href="/browse" className="hover:text-brand">Browse Temps</Link></li>
                <li><Link href="/contact" className="hover:text-brand">Request Staff</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">For Temps</p>
              <ul className="space-y-1 text-gray-600">
                <li><Link href="/register" className="hover:text-brand">Register</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Company</p>
              <ul className="space-y-1 text-gray-600">
                <li><Link href="/about" className="hover:text-brand">About Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-brand">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 pb-6">
            © {new Date().getFullYear()} Find A Temp. All rights reserved.
          </div>
</footer>
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
