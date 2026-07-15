import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'gerard@findatemp.ie';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@findatemp.ie';

type RequestType = 'CV' | 'INTERVIEW' | 'TRIAL';

const REQUEST_LABELS: Record<RequestType, string> = {
  CV: 'Full CV',
  INTERVIEW: 'An Interview',
  TRIAL: 'A Temporary Trial',
};

/**
 * Notifies the admin when a company requests a CV / interview / trial for a temp.
 * For CV requests specifically, includes the blob URL so the admin can review it
 * before deciding whether to share — this is the GDPR consent checkpoint.
 */
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

  const cvNote =
    requestType === 'CV'
      ? `<p><strong>Note:</strong> Please check with ${temp.fullName} before sharing their CV — do not forward it automatically.</p>
         <p>CV file: <a href="${temp.cvUrl}">${temp.cvUrl}</a></p>`
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
    // Don't throw — the Request row is already saved in the DB, so the
    // enquiry isn't lost even if the email fails. Check the admin panel.
  }
}

/**
 * Notifies the admin when a new temp registers, so they know to review/approve.
 */
export async function sendNewRegistrationNotification(params: {
  fullName: string;
  email: string;
  areaName: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Temp Registration: ${params.fullName}`,
      html: `<p>${params.fullName} (${params.email}) registered from ${params.areaName}. Review and approve in the admin panel.</p>`,
    });
  } catch (err) {
    console.error('Failed to send registration notification email:', err);
  }
}
