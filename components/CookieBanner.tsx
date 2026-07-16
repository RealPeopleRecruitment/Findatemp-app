'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'findatemp_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          We use only strictly necessary cookies to run this site — we don&apos;t currently use any
          analytics or tracking cookies. See our{' '}
          <a href="/cookie-policy" className="text-brand underline">Cookie Policy</a> for details.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={decline} className="btn-secondary text-sm">Decline</button>
          <button onClick={accept} className="btn-primary text-sm">Accept</button>
        </div>
      </div>
    </div>
  );
}

export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}
