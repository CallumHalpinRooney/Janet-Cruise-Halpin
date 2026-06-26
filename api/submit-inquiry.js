/* Vercel serverless — submit-inquiry.js
   Receives inquiry form POST, stores in Supabase, emails Janet via EmailJS.
   Supabase credentials are hardcoded (anon key, safe with RLS).
   EmailJS env vars (optional — add when ready):
     EMAILJS_SERVICE_ID
     EMAILJS_TEMPLATE_ID
     EMAILJS_PRIVATE_KEY
*/

const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  const { name, email, painting, message, painting_img } = data;
  if (!name || !email || !message) {
    return res.status(400).send('Missing required fields');
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  try {
    const sb = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ name, email, painting, message, painting_img }),
    });
    if (!sb.ok) errors.push(`Supabase: ${await sb.text()}`);
  } catch (e) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2. Email Janet via EmailJS ──────────────────── */
  try {
    const ejServiceId  = process.env.EMAILJS_SERVICE_ID;
    const ejTemplateId = process.env.EMAILJS_TEMPLATE_ID;
    const ejPrivateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (ejServiceId && ejTemplateId && ejPrivateKey) {
      const ej = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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
      if (!ej.ok) errors.push(`EmailJS: ${await ej.text()}`);
    }
  } catch (e) {
    errors.push(`EmailJS exception: ${e.message}`);
  }

  if (errors.length > 0) console.error('submit-inquiry errors:', errors);

  return res.status(200).json({ success: true, warnings: errors });
};
