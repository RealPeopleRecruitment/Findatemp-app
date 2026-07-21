'use client';

import { useState, useTransition } from 'react';
import { approveTemp, rejectTemp, approveMany } from './actions';

type PendingTemp = {
  id: string;
  fullName: string;
  contactLine: string;
  areaName: string;
  categoryNames: string[];
  payMin: number;
  payMax: number;
  drives: boolean;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  cvUrl: string;
};

export default function PendingList({ temps }: { temps: PendingTemp[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = temps.length > 0 && temps.every((t) => selected.has(t.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(temps.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleApproveSelected() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await approveMany(ids);
      setSelected(new Set());
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-4 sticky top-16 z-10">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4" />
          Select all on this page ({temps.length})
        </label>
        <button
          onClick={handleApproveSelected}
          disabled={selected.size === 0 || isPending}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {isPending ? 'Approving…' : `Approve Selected (${selected.size})`}
        </button>
      </div>

      <div className="space-y-4">
        {temps.map((temp) => (
          <div key={temp.id} className="card flex gap-4">
            <input
              type="checkbox"
              checked={selected.has(temp.id)}
              onChange={() => toggleOne(temp.id)}
              className="w-4 h-4 mt-1 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-semibold text-lg">{temp.fullName}</h2>
                  <p className="text-sm text-gray-500">
                    {temp.contactLine} · {temp.areaName}
                  </p>
                </div>
                <p className="font-bold text-brand">
                  €{temp.payMin.toFixed(2)}–€{temp.payMax.toFixed(2)}/hr
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 my-2">
                {temp.categoryNames.map((name) => (
                  <span key={name} className="tag">{name}</span>
                ))}
                {temp.drives && <span className="tag">🚗 Driver</span>}
              </div>

              <ul className="text-sm text-gray-700 list-disc list-inside mb-3">
                <li>{temp.bullet1}</li>
                <li>{temp.bullet2}</li>
                <li>{temp.bullet3}</li>
              </ul>

              {temp.cvUrl ? (
                <a href={`/api/admin/cv?pathname=${encodeURIComponent(temp.cvUrl)}`} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
                  View CV
                </a>
              ) : (
                <p className="text-sm text-gray-400 italic">No CV on file</p>
              )}

              <div className="flex gap-3 mt-4">
                <form action={approveTemp.bind(null, temp.id)}>
                  <button type="submit" className="btn-primary text-sm">Approve</button>
                </form>
                <form action={rejectTemp.bind(null, temp.id)}>
                  <button type="submit" className="btn-secondary text-sm">Reject</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
