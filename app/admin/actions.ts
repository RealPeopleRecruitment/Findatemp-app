'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { calcPayMax } from '@/lib/pay';

export async function approveTemp(tempId: string) {
  await prisma.temp.update({ where: { id: tempId }, data: { status: 'APPROVED' } });
  revalidatePath('/admin');
  revalidatePath('/browse');
}

export async function rejectTemp(tempId: string) {
  await prisma.temp.update({ where: { id: tempId }, data: { status: 'REJECTED' } });
  revalidatePath('/admin');
}

export async function approveMany(tempIds: string[]) {
  await prisma.temp.updateMany({ where: { id: { in: tempIds } }, data: { status: 'APPROVED' } });
  revalidatePath('/admin');
  revalidatePath('/browse');
}

export async function approveAllPending() {
  await prisma.temp.updateMany({ where: { status: 'PENDING' }, data: { status: 'APPROVED' } });
  revalidatePath('/admin');
  revalidatePath('/browse');
}

// Narrows every existing profile's pay range using the same rule as new sign-ups:
// keep the person's lowest rate, and cap the top at lowest + €1.50 (rounded up to 50c).
// Only lowers ranges that are wider than that; never raises anyone's rate.
export async function tidyPayRanges(): Promise<{ updated: number; total: number }> {
  const mins = await prisma.temp.groupBy({ by: ['payMin'] });
  const total = await prisma.temp.count();

  let updated = 0;
  for (const { payMin } of mins) {
    const cap = calcPayMax(Number(payMin));
    const res = await prisma.temp.updateMany({
      where: { payMin, payMax: { gt: cap } },
      data: { payMax: cap },
    });
    updated += res.count;
  }

  revalidatePath('/admin');
  revalidatePath('/browse');
  revalidatePath('/', 'layout');
  return { updated, total };
}
