const CATS_API_BASE = 'https://api.catsone.com/v3';

function toIrishInternationalFormat(rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/[^\d+]/g, '');
  if (digitsOnly.startsWith('+')) return digitsOnly;
  if (digitsOnly.startsWith('00')) return `+${digitsOnly.slice(2)}`;
  if (digitsOnly.startsWith('0')) return `+353${digitsOnly.slice(1)}`;
  return `+353${digitsOnly}`;
}

type PushCandidateParams = {
  fullName: string;
  email: string;
  phone: string;
  areaName: string;
  categoryNames: string[];
  payMin: number;
  payMax: number;
  drives: boolean;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  cvBuffer: Buffer;
  cvFilename: string;
};

type PushCandidateResult = {
  success: boolean;
  candidateId?: string;
  error?: string;
};

async function uploadResume(
  apiKey: string,
  candidateId: string,
  cvBuffer: Buffer,
  cvFilename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resumeRes = await fetch(
      `${CATS_API_BASE}/candidates/${candidateId}/resumes?filename=${encodeURIComponent(cvFilename)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: new Uint8Array(cvBuffer),
      }
    );

    if (!resumeRes.ok) {
      const text = await resumeRes.text().catch(() => '');
      return { success: false, error: `resume upload failed (${resumeRes.status}): ${text}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: `resume upload errored: ${String(err)}` };
  }
}

export async function pushCandidateToCats(params: PushCandidateParams): Promise<PushCandidateResult> {
  const apiKey = process.env.CATS_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'CATS_API_KEY is not set — skipping CATS sync.' };
  }

  const nameParts = params.fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '(not provided)';

  const notes = [
    `Registered via findatemp.ie (${new Date().toLocaleDateString('en-IE')})`,
    `Area: ${params.areaName}`,
    `Categories: ${params.categoryNames.join(', ')}`,
    `Driver: ${params.drives ? 'Yes' : 'No'}`,
    '',
    `- ${params.bullet1}`,
    `- ${params.bullet2}`,
    `- ${params.bullet3}`,
  ].join('\n');

  const desiredPay = `EUR ${params.payMin.toFixed(2)}-${params.payMax.toFixed(2)}/hr`;

  const candidateBody = {
    first_name: firstName,
    last_name: lastName,
    emails: [{ email: params.email, is_primary: true }],
    phones: [{ number: toIrishInternationalFormat(params.phone), type: 'mobile' }],
    address: { city: params.areaName, state: 'Dublin' },
    country_code: 'IE',
    key_skills: params.categoryNames.join(', '),
    desired_pay: desiredPay,
    notes,
    source: 'Find A Temp Website',
    is_active: true,
  };

  let candidateRes: Response;
  try {
    candidateRes = await fetch(`${CATS_API_BASE}/candidates?check_duplicate=true`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateBody),
    });
  } catch (err) {
    return { success: false, error: `Network error contacting CATS: ${String(err)}` };
  }

  if (candidateRes.status === 409) {
    const body = await candidateRes.json().catch(() => null);
    const existingId = body?.data_item?.id ? String(body.data_item.id) : undefined;

    if (!existingId) {
      return { success: false, error: `CATS reported a duplicate but no ID was returned: ${JSON.stringify(body)}` };
    }

    try {
      const updateRes = await fetch(`${CATS_API_BASE}/candidates/${existingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          address: { city: params.areaName, state: 'Dublin' },
          country_code: 'IE',
          key_skills: params.categoryNames.join(', '),
          desired_pay: desiredPay,
          notes,
          is_active: true,
        }),
      });

      if (!updateRes.ok) {
        const text = await updateRes.text().catch(() => '');
        return {
          success: true,
          candidateId: existingId,
          error: `Found existing candidate (ID ${existingId}) but update failed (${updateRes.status}): ${text}`,
        };
      }
    } catch (err) {
      return {
        success: true,
        candidateId: existingId,
        error: `Found existing candidate (ID ${existingId}) but update errored: ${String(err)}`,
      };
    }

    const resumeResult = await uploadResume(apiKey, existingId, params.cvBuffer, params.cvFilename);
    if (!resumeResult.success) {
      return {
        success: true,
        candidateId: existingId,
        error: `Updated existing candidate (ID ${existingId}) but ${resumeResult.error}`,
      };
    }

    return { success: true, candidateId: existingId };
  }

  if (!candidateRes.ok) {
    const text = await candidateRes.text().catch(() => '');
    return { success: false, error: `CATS candidate creation failed (${candidateRes.status}): ${text}` };
  }

  const location = candidateRes.headers.get('location');
  const candidateId = location?.split('/').filter(Boolean).pop();

  if (!candidateId) {
    return { success: true, error: 'Candidate created in CATS, but no ID returned — resume was not uploaded.' };
  }

  const resumeResult = await uploadResume(apiKey, candidateId, params.cvBuffer, params.cvFilename);
  if (!resumeResult.success) {
    return { success: true, candidateId, error: `Candidate created (ID ${candidateId}) but ${resumeResult.error}` };
  }

  return { success: true, candidateId };
}
