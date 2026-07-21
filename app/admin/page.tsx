import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PendingList from './PendingList';
import ApproveAllButton from './ApproveAllButton';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const [pendingRaw, totalPending, approvedCount, requestCount] = await Promise.all([
    prisma.temp.findMany({
      where: { status: 'PENDING' },
      include: { area: true, categories: { include: { category: true } } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.temp.count({ where: { status: 'PENDING' } }),
    prisma.temp.count({ where: { status: 'APPROVED' } }),
    prisma.request.count({ where: { followedUp: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPending / PAGE_SIZE));

  const pending = pendingRaw.map((temp) => ({
    id: temp.id,
    fullName: temp.fullName,
    contactLine:
      temp.email && temp.phone
        ? `${temp.email} · ${temp.phone}`
        : temp.externalRef
          ? `Ref: ${temp.externalRef} (no direct contact — cross-reference your own records)`
          : 'No contact info on file',
    areaName: temp.area.name,
    categoryNames: temp.categories.map((c) => c.category.name),
    payMin: Number(temp.payMin),
    payMax: Number(temp.payMax),
    drives: temp.drives,
    bullet1: temp.bullet1,
    bullet2: temp.bullet2,
    bullet3: temp.bullet3,
    cvUrl: temp.cvUrl,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          Admin — Pending Registrations
          <span className="text-gray-400 font-normal text-lg"> ({totalPending} total)</span>
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{approvedCount} approved</span>
          <Link href="/admin/requests" className="text-brand underline">
            {requestCount} request{requestCount === 1 ? "" : "s"} awaiting follow-up
          </Link>
          <ApproveAllButton totalPending={totalPending} />
        </div>
      </div>

      {pending.length === 0 ? (
        <p className="text-gray-500">No pending registrations. 🎉</p>
      ) : (
        <>
          <PendingList temps={pending} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              {page > 1 && (
                <Link href={`/admin?page=${page - 1}`} className="btn-secondary text-sm">
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/admin?page=${page + 1}`} className="btn-secondary text-sm">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
