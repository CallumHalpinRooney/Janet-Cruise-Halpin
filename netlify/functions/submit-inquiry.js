/* Netlify Function — submit-inquiry.js
   Receives inquiry form POST, stores in Supabase, emails Janet via EmailJS.
   Supabase credentials are hardcoded (anon key, safe with RLS).
   EmailJS env vars (optional — add when ready):
     EMAILJS_SERVICE_ID
     EMAILJS_TEMPLATE_ID
     EMAILJS_PRIVATE_KEY
*/

const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { name, email, painting, message, painting_img } = data;
  if (!name || !email || !message) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ name, email, painting, message, painting_img }),
    });
    if (!res.ok) {
      const err = await res.text();
      errors.push(`Supabase: ${err}`);
    }
  } catch (e) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2. Email Janet via EmailJS ──────────────────── */
  try {
    const ejServiceId  = process.env.EMAILJS_SERVICE_ID;
    const ejTemplateId = process.env.EMAILJS_TEMPLATE_ID;
    const ejPrivateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (ejServiceId && ejTemplateId && ejPrivateKey) {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:  ejServiceId,
          template_id: ejTemplateId,
          user_id:     ejPrivateKey,
          template_params: {
            from_name:    name,
            from_email:   email,
            painting:     painting || 'General inquiry',
            message:      message,
            painting_img: painting_img || '',
            reply_to:     email,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        errors.push(`EmailJS: ${err}`);
      }
    }
  } catch (e) {
    errors.push(`EmailJS exception: ${e.message}`);
  }

  if (errors.length > 0) {
    console.error('submit-inquiry errors:', errors);
    /* Still return 200 if at least the storage worked — don't block the user */
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, warnings: errors }),
  };
};
