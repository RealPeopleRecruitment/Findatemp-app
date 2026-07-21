import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRequestNotification, sendVerificationCodeEmail } from '@/lib/email';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRequestRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const VALID_TYPES = ['CV', 'INTERVIEW', 'TRIAL'];

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const withinLimit = await checkRequestRateLimit(req);
    if (!withinLimit) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 });
    }

    const body = await req.json();
    const { tempId, type, companyName, contactName, email, phone, message, turnstileToken } = body;

    const humanVerified = await verifyTurnstileToken(turnstileToken);
    if (!humanVerified) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    }

    if (!tempId || !VALID_TYPES.includes(type) || !companyName || !contactName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const temp = await prisma.temp.findUnique({ where: { id: tempId } });
    if (!temp || temp.status !== 'APPROVED') {
      return NextResponse.json({ error: 'This temp is no longer available.' }, { status: 404 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingVerified = await prisma.verifiedContact.findUnique({ where: { email: normalizedEmail } });
    if (existingVerified) {
      await prisma.request.create({
        data: { tempId, type, companyName, contactName, email, phone, message: message || null },
      });
      await sendRequestNotification({
        requestType: type,
        temp: { id: temp.id, fullName: temp.fullName, cvUrl: temp.cvUrl },
        companyName,
        contactName,
        email,
        phone,
        message,
      });
      return NextResponse.json({ verified: true });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const verification = await prisma.verificationCode.create({
      data: {
        email,
        phone,
        code,
        tempId,
        requestType: type,
        companyName,
        contactName,
        message: message || null,
        expiresAt,
      },
    });

    const emailSent = await sendVerificationCodeEmail(email, code);

    if (!emailSent) {
      await prisma.verificationCode.delete({ where: { id: verification.id } });
      return NextResponse.json(
        { error: 'Could not send a verification code to that email. Please double-check the address.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ verified: false, verificationId: verification.id });
  } catch (err) {
    console.error('Request start error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
