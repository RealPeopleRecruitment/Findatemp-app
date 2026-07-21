'use client';

import { useState } from 'react';
import Link from 'next/link';

type ComboLink = {
  key: string;
  href: string;
  label: string;
};

export default function ComboFilterToggle({
  links,
  toggleLabel,
}: {
  links: ComboLink[];
  toggleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  if (links.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
      >
        {toggleLabel} ({links.length})
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="flex flex-wrap gap-2 mt-3">
          {links.map((link) => (
            <Link key={link.key} href={link.href} className="tag hover:bg-brand hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
