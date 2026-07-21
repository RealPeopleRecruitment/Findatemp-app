import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { sendProfileExpiryWarning } from '@/lib/email';

export const runtime = 'nodejs';

const WARNING_AGE_DAYS = 24 * 30 - 30;
const GRACE_PERIOD_DAYS = 30;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const needsWarning = await prisma.temp.findMany({
    where: {
      email: { not: null },
      expiryWarningSentAt: null,
      updatedAt: { lte: daysAgo(WARNING_AGE_DAYS) },
    },
  });

  let warned = 0;
  for (const temp of needsWarning) {
    const sent = await sendProfileExpiryWarning({
      email: temp.email!,
      fullName: temp.fullName,
      tempId: temp.id,
    });
    if (sent) {
      await prisma.temp.update({
        where: { id: temp.id },
        data: { expiryWarningSentAt: new Date() },
      });
      warned++;
    }
  }

  const toDelete = await prisma.temp.findMany({
    where: { expiryWarningSentAt: { lte: daysAgo(GRACE_PERIOD_DAYS) } },
  });

  let deleted = 0;
  for (const temp of toDelete) {
    if (temp.cvUrl) {
      try {
        await del(temp.cvUrl);
      } catch (err) {
        console.error(`Failed to delete blob for temp ${temp.id}:`, err);
      }
    }
    await prisma.temp.delete({ where: { id: temp.id } });
    deleted++;
  }

  return NextResponse.json({ warned, deleted });
}
