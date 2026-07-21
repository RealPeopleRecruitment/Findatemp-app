import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { sendNewRegistrationNotification } from '@/lib/email';
import { pushCandidateToCats } from '@/lib/cats';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRegisterRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MINIMUM_WAGE = 14.15;

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
  try {
    const withinLimit = await checkRegisterRateLimit(req);
    if (!withinLimit) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 });
    }

    const formData = await req.formData();

    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const areaId = String(formData.get('areaId') || '').trim();
    const payMin = parseFloat(String(formData.get('payMin') || ''));
    const payMax = parseFloat(String(formData.get('payMax') || ''));
    const drives = formData.get('drives') === 'true';
    const bullet1 = String(formData.get('bullet1') || '').trim();
    const bullet2 = String(formData.get('bullet2') || '').trim();
    const bullet3 = String(formData.get('bullet3') || '').trim();
    const categoryIds = formData.getAll('categoryIds').map(String);
    const cvFile = formData.get('cv') as File | null;
    const turnstileToken = String(formData.get('turnstileToken') || '');

    const humanVerified = await verifyTurnstileToken(turnstileToken);
    if (!humanVerified) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    }

    if (!fullName || !email || !phone || !areaId || !bullet1 || !bullet2 || !bullet3) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (isNaN(payMin) || isNaN(payMax) || payMin < 0 || payMax < payMin) {
      return NextResponse.json({ error: 'Please enter a valid pay range.' }, { status: 400 });
    }
    if (payMin < MINIMUM_WAGE) {
      return NextResponse.json(
        {
          error: `We require a minimum rate of €${MINIMUM_WAGE.toFixed(2)}/hr, in line with the Irish National Minimum Wage. Please adjust your rate and try again.`,
        },
        { status: 400 }
      );
    }
    if (categoryIds.length === 0) {
      return NextResponse.json({ error: 'Please select at least one category.' }, { status: 400 });
    }
    if (!cvFile || cvFile.size === 0) {
      return NextResponse.json({ error: 'Please upload your CV.' }, { status: 400 });
    }
    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      return NextResponse.json({ error: 'CV file is too large (max 5MB).' }, { status: 400 });
    }
    if (!ALLOWED_CV_TYPES.includes(cvFile.type)) {
      return NextResponse.json({ error: 'CV must be a PDF or Word document.' }, { status: 400 });
    }

    const area = await prisma.area.findUnique({ where: { id: areaId } });
    if (!area) {
      return NextResponse.json({ error: 'Invalid area selected.' }, { status: 400 });
    }

    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });

    const cvArrayBuffer = await cvFile.arrayBuffer();
    const cvBuffer = Buffer.from(cvArrayBuffer);

    const safeName = cvFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const blob = await put(`cvs/${Date.now()}-${safeName}`, cvBuffer, {
      access: 'private',
      addRandomSuffix: true,
      contentType: cvFile.type,
    });

    const temp = await prisma.temp.create({
      data: {
        fullName,
        email,
        phone,
        areaId,
        payMin,
        payMax,
        drives,
        bullet1,
        bullet2,
        bullet3,
        cvUrl: blob.pathname,
        status: 'PENDING',
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    const catsResult = await pushCandidateToCats({
      fullName,
      email,
      phone,
      areaName: area.name,
      categoryNames: categories.map((c) => c.name),
      payMin,
      payMax,
      drives,
      bullet1,
      bullet2,
      bullet3,
      cvBuffer,
      cvFilename: safeName,
    });

    if (!catsResult.success || catsResult.error) {
      console.error('CATS sync issue:', catsResult.error);
    }

    await sendNewRegistrationNotification({
      fullName,
      email,
      areaName: area.name,
      catsSuccess: catsResult.success,
      catsCandidateId: catsResult.candidateId,
      catsError: catsResult.error,
    });

    return NextResponse.json({ success: true, id: temp.id });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
