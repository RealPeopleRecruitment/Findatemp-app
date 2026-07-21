'use client';

import { useTransition } from 'react';
import { approveAllPending } from './actions';

export default function ApproveAllButton({ totalPending }: { totalPending: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Approve all ${totalPending} pending profiles? This publishes every one of them to the live site immediately.`
    );
    if (!confirmed) return;
    startTransition(() => {
      approveAllPending();
    });
  }

  if (totalPending === 0) return null;

  return (
    <button onClick={handleClick} disabled={isPending} className="btn-secondary text-sm disabled:opacity-50">
      {isPending ? 'Approving all…' : `Approve All ${totalPending} Pending`}
    </button>
  );
}
