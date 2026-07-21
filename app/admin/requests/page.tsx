import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { toggleFollowedUp } from './actions';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  CV: 'CV Request',
  INTERVIEW: 'Interview Request',
  TRIAL: 'Trial Request',
};

export default async function AdminRequestsPage() {
  const requests = await prisma.request.findMany({
    include: { temp: true },
    orderBy: [{ followedUp: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  });

  const outstandingCount = requests.filter((r) => !r.followedUp).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Admin — Company Requests</h1>
        <Link href="/admin" className="text-brand underline text-sm">Back to registrations</Link>
      </div>
      <p className="text-gray-500 mb-8">
        {outstandingCount} awaiting follow-up · {requests.length - outstandingCount} followed up
      </p>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className={`card ${r.followedUp ? 'bg-gray-50 opacity-70' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">
                  {TYPE_LABELS[r.type]} — {r.temp.fullName}
                  {r.followedUp && <span className="tag ml-2">✅ Followed up</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {r.companyName} · {r.contactName} · {r.email} · {r.phone}
                </p>
                {r.message && <p className="text-sm text-gray-700 mt-2">&quot;{r.message}&quot;</p>}
              </div>
              <p className="text-xs text-gray-400 shrink-0 ml-4">{new Date(r.createdAt).toLocaleString('en-IE')}</p>
            </div>

            {r.type === 'CV' && (
              <a href={`/api/admin/cv?pathname=${encodeURIComponent(r.temp.cvUrl)}`} target="_blank" rel="noreferrer" className="text-sm text-brand underline mt-2 inline-block">
                View CV — confirm with temp before sharing
              </a>
            )}

            <div className="mt-3">
              <form action={toggleFollowedUp.bind(null, r.id, !r.followedUp)}>
                <button type="submit" className={r.followedUp ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
                  {r.followedUp ? 'Mark as not followed up' : 'Mark as followed up'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
