import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  CV: 'CV Request',
  INTERVIEW: 'Interview Request',
  TRIAL: 'Trial Request',
};

export default async function AdminRequestsPage() {
  const requests = await prisma.request.findMany({
    include: { temp: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin — Company Requests</h1>
        <Link href="/admin" className="text-brand underline text-sm">Back to registrations</Link>
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{TYPE_LABELS[r.type]} — {r.temp.fullName}</p>
                <p className="text-sm text-gray-500">
                  {r.companyName} · {r.contactName} · {r.email} · {r.phone}
                </p>
                {r.message && <p className="text-sm text-gray-700 mt-2">&quot;{r.message}&quot;</p>}
              </div>
              <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('en-IE')}</p>
            </div>
            {r.type === 'CV' && (
              <a href={r.temp.cvUrl} target="_blank" rel="noreferrer" className="text-sm text-brand underline mt-2 inline-block">
                View CV — confirm with temp before sharing
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
