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
