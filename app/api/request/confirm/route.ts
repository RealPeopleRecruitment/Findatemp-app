import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRequestNotification } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
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
      update: { phone: verification.phone, verifiedAt: new Date() },
      create: { email: verification.email.toLowerCase().trim(), phone: verification.phone },
    });

    await sendRequestNotification({
      requestType: verification.requestType,
      temp: { id: temp.id, fullName: temp.fullName, cvUrl: temp.cvUrl },
      companyName: verification.companyName,
      contactName: verification.contactName,
      email: verification.email,
      phone: verification.phone,
      message: verification.message || undefined,
    });

    await prisma.verificationCode.delete({ where: { id: verification.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Request confirm error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
