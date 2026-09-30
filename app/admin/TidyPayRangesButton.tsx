'use client';

import { useState, useTransition } from 'react';
import { tidyPayRanges } from './actions';

export default function TidyPayRangesButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm(
      'Tidy all pay ranges? Every profile keeps its lowest rate, and the top rate is capped at lowest + €1.50 (rounded up to the next 50c). Only ranges wider than that are changed.'
    );
    if (!confirmed) return;
    startTransition(async () => {
      const { updated, total } = await tidyPayRanges();
      setResult(`Done: ${updated} of ${total} profiles tidied.`);
    });
  }

  return (
    <span className="flex items-center gap-2">
      <button onClick={handleClick} disabled={isPending} className="btn-secondary text-sm disabled:opacity-50">
        {isPending ? 'Tidying…' : 'Tidy Pay Ranges'}
      </button>
      {result && <span className="text-green-700">{result}</span>}
    </span>
  );
}
