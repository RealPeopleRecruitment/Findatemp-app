'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Option = { slug: string; name: string };

export default function FilterBar({
  areas,
  categories,
  hideAreaFilter = false,
  hideCategoryFilter = false,
}: {
  areas: Option[];
  categories: Option[];
  hideAreaFilter?: boolean;
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl mb-8">
      {!hideAreaFilter && (
        <div>
          <label className="block text-xs font-semibold mb-1">Area</label>
          <select
            defaultValue={searchParams.get('area') || ''}
            onChange={(e) => updateParam('area', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Dublin Areas</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>
        </div>
      )}
      {!hideCategoryFilter && (
        <div>
          <label className="block text-xs font-semibold mb-1">Category</label>
          <select
            defaultValue={searchParams.get('category') || ''}
            onChange={(e) => updateParam('category', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold mb-1">Max Rate (€/hr)</label>
        <input
          type="number"
          defaultValue={searchParams.get('maxRate') || ''}
          onBlur={(e) => updateParam('maxRate', e.target.value)}
          placeholder="Any"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
        />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={searchParams.get('drives') === 'true'}
            onChange={(e) => updateParam('drives', e.target.checked ? 'true' : '')}
            className="w-4 h-4"
          />
          Driver only
        </label>
      </div>
    </div>
  );
}
