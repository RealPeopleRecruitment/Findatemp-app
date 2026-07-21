'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleFollowedUp(requestId: string, newValue: boolean) {
  await prisma.request.update({
    where: { id: requestId },
    data: { followedUp: newValue },
  });
  revalidatePath('/admin/requests');
  revalidatePath('/admin');
}

