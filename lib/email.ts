import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'gerard@findatemp.ie';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@findatemp.ie';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findatemp.ie';

const PERSONAL_EMAIL_DOMAINS = [
  'hotmail.com', 'hotmail.co.uk', 'hotmail.ie',
  'outlook.com', 'outlook.ie', 'live.com', 'live.ie', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.ie',
  'aol.com', 'icloud.com', 'me.com', 'mail.com', 'gmx.com',
  'protonmail.com', 'yandex.com',
];

function isPersonalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return !!domain && PERSONAL_EMAIL_DOMAINS.includes(domain);
}

type RequestType = 'CV' | 'INTERVIEW' | 'TRIAL';

const REQUEST_LABELS: Record<RequestType, string> = {
  CV: 'Full CV',
  INTERVIEW: 'An Interview',
  TRIAL: 'A Temporary Trial',
};

export async function sendRequestNotification(params: {
  requestType: RequestType;
  temp: { id: string; fullName: string; cvUrl: string };
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message?: string;
}) {
  const { requestType, temp, companyName, contactName, email, phone, message } = params;

  const subject = `New Request: ${REQUEST_LABELS[requestType]} — ${temp.fullName} (${companyName})`;

  const cvLink = `${SITE_URL}/api/admin/cv?pathname=${encodeURIComponent(temp.cvUrl)}`;
  const cvNote =
    requestType === 'CV'
      ? `<p><strong>Note:</strong> Please check with ${temp.fullName} before sharing their CV — do not forward it automatically.</p>
         <p>View CV (requires your admin login): <a href="${cvLink}">${cvLink}</a></p>`
      : '';

  const personalEmailNote = isPersonalEmail(email)
    ? `<p style="color:#c0392b;"><strong>⚠️ Personal email address</strong> (${email.split('@')[1]}) — not a business domain like a company website's own email.</p>`
    : '';

  const html = `
    <h2>New ${REQUEST_LABELS[requestType]} Request</h2>
    <p><strong>Temp:</strong> ${temp.fullName} (ID: ${temp.id})</p>
    <hr />
    ${personalEmailNote}
    <p><strong>Company:</strong> ${companyName}</p>
    <p><strong>Contact name:</strong> ${contactName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
    ${cvNote}
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject,
      html,
    });
  } catch (err) {
    console.error('Failed to send request notification email:', err);
  }
}

export async function sendVerificationCodeEmail(email: string, code: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Find A Temp verification code: ${code}`,
      html: `
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Enter this on the Find A Temp site to confirm your request. It expires in 10 minutes.</p>
        <p style="color:#666; font-size: 13px;">Don't see this in your inbox? Please check your spam or junk folder.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Failed to send verification email:', err);
    return false;
  }
}

export async function sendNewRegistrationNotification(params: {
  fullName: string;
  email: string;
  areaName: string;
  catsSuccess?: boolean;
  catsCandidateId?: string;
  catsError?: string;
}) {
  const catsLine = params.catsSuccess
    ? `<p>✅ Synced to CATS — candidate ID ${params.catsCandidateId}.</p>`
    : `<p>⚠️ Not synced to CATS: ${params.catsError || 'unknown error'}. Add them manually if needed.</p>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Temp Registration: ${params.fullName}`,
      html: `<p>${params.fullName} (${params.email}) registered from ${params.areaName}. Review and approve in the admin panel.</p>${catsLine}`,
    });
  } catch (err) {
    console.error('Failed to send registration notification email:', err);
  }
}

export async function sendProfileExpiryWarning(params: {
  email: string;
  fullName: string;
  tempId: string;
}): Promise<boolean> {
  const renewLink = `${SITE_URL}/api/temp/confirm-active?id=${params.tempId}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: 'Your Find A Temp profile — action needed to stay listed',
      html: `
        <p>Hi ${params.fullName.split(' ')[0]},</p>
        <p>Your profile on Find A Temp hasn't been updated in a while. In line with our data
        retention policy, it will be automatically removed in 30 days unless you let us know
        you're still looking for work.</p>
        <p><a href="${renewLink}" style="display:inline-block;background:#0b5fff;color:#fff;
        padding:10px 20px;border-radius:6px;text-decoration:none;">Keep my profile active</a></p>
        <p>If you no longer want to be listed, you don't need to do anything — your profile and
        CV will be automatically deleted.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Failed to send profile expiry warning email:', err);
    return false;
  }
}
