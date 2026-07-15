import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRequestNotification } from '@/lib/email';

export const runtime = 'nodejs';

const VALID_TYPES = ['CV', 'INTERVIEW', 'TRIAL'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tempId, type, companyName, contactName, email, phone, message } = body;

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Request submission error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
