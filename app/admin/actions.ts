'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
