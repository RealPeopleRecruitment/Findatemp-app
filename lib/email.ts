import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'gerard@findatemp.ie';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@findatemp.ie';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findatemp.ie';

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

  const html = `
    <h2>New ${REQUEST_LABELS[requestType]} Request</h2>
    <p><strong>Temp:</strong> ${temp.fullName} (ID: ${temp.id})</p>
    <hr />
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
