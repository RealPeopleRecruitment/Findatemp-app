import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const temp = await prisma.temp.findUnique({ where: { id } });
  if (!temp) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  await prisma.temp.update({
    where: { id },
    data: { expiryWarningSentAt: null },
  });

  return NextResponse.redirect(new URL('/profile-renewed', req.url));
}
