'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasCookieConsent } from './CookieBanner';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasCookieConsent());

    function onAccept() {
      setConsented(true);
    }
    window.addEventListener('cookie-consent-accepted', onAccept);
    return () => window.removeEventListener('cookie-consent-accepted', onAccept);
  }, []);

  if (!GA_ID || !consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}

