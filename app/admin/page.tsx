import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { approveTemp, rejectTemp } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [pending, approvedCount, requestCount] = await Promise.all([
    prisma.temp.findMany({
      where: { status: 'PENDING' },
      include: { area: true, categories: { include: { category: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.temp.count({ where: { status: 'APPROVED' } }),
    prisma.request.count(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin — Pending Registrations</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">{approvedCount} approved</span>
          <Link href="/admin/requests" className="text-brand underline">
            View {requestCount} requests
          </Link>
        </div>
      </div>

      {pending.length === 0 ? (
        <p className="text-gray-500">No pending registrations. 🎉</p>
      ) : (
        <div className="space-y-4">
          {pending.map((temp) => (
            <div key={temp.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-semibold text-lg">{temp.fullName}</h2>
                  <p className="text-sm text-gray-500">
                    {temp.email} · {temp.phone} · {temp.area.name}
                  </p>
                </div>
                <p className="font-bold text-brand">
                  €{Number(temp.payMin).toFixed(2)}–€{Number(temp.payMax).toFixed(2)}/hr
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 my-2">
                {temp.categories.map((c) => (
                  <span key={c.category.id} className="tag">{c.category.name}</span>
                ))}
                {temp.drives && <span className="tag">🚗 Driver</span>}
              </div>

              <ul className="text-sm text-gray-700 list-disc list-inside mb-3">
                <li>{temp.bullet1}</li>
                <li>{temp.bullet2}</li>
                <li>{temp.bullet3}</li>
              </ul>

              <a href={`/api/admin/cv?pathname=${encodeURIComponent(temp.cvUrl)}`} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
                View CV
              </a>

              <div className="flex gap-3 mt-4">
                <form action={approveTemp.bind(null, temp.id)}>
                  <button type="submit" className="btn-primary text-sm">Approve</button>
                </form>
                <form action={rejectTemp.bind(null, temp.id)}>
                  <button type="submit" className="btn-secondary text-sm">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
