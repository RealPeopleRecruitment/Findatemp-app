import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRequestNotification } from '@/lib/email';
import { checkConfirmRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const withinLimit = await checkConfirmRateLimit(req);
    if (!withinLimit) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 });
    }

    const { verificationId, code } = await req.json();

    if (!verificationId || !code) {
      return NextResponse.json({ error: 'Missing verification details.' }, { status: 400 });
    }

    const verification = await prisma.verificationCode.findUnique({ where: { id: verificationId } });
    if (!verification) {
      return NextResponse.json({ error: 'Verification session not found. Please start again.' }, { status: 404 });
    }

    if (verification.expiresAt < new Date()) {
      await prisma.verificationCode.delete({ where: { id: verification.id } });
      return NextResponse.json({ error: 'This code has expired. Please start again.' }, { status: 400 });
    }

    if (verification.code !== String(code).trim()) {
      return NextResponse.json({ error: 'Incorrect code. Please check and try again.' }, { status: 400 });
    }

    const temp = await prisma.temp.findUnique({ where: { id: verification.tempId } });
    if (!temp) {
      return NextResponse.json({ error: 'This temp is no longer available.' }, { status: 404 });
    }

    await prisma.request.create({
      data: {
        tempId: verification.tempId,
        type: verification.requestType,
        companyName: verification.companyName,
        contactName: verification.contactName,
        email: verification.email,
        phone: verification.phone,
        message: verification.message,
      },
    });

    await prisma.verifiedContact.upsert({
      where: { email: verification.email.toLowerCase().trim() },
      update: { phone:

