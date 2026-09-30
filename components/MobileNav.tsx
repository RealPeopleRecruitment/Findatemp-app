'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="p-2 -mr-2 text-gray-700"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-1 text-sm font-medium">
            <Link href="/browse" onClick={() => setOpen(false)} className="py-2 hover:text-brand">Browse Temps</Link>
            <Link href="/#categories" onClick={() => setOpen(false)} className="py-2 hover:text-brand">Categories</Link>
            <Link href="/#areas" onClick={() => setOpen(false)} className="py-2 hover:text-brand">Dublin Areas</Link>
            <Link href="/testimonials" onClick={() => setOpen(false)} className="py-2 hover:text-brand">Testimonials</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="py-2 hover:text-brand">About</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="py-2 hover:text-brand">Contact</Link>
          </nav>
        </div>
      )}
    </div>
  );
}
