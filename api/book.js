/* Vercel serverless — book.js
   Receives a booking request from the Thomas Collins Hair Studio site,
   stores it in Supabase and (optionally) emails the studio via EmailJS.

   Mirrors submit-inquiry.js. Everything degrades gracefully: if a table
   or an env var is missing, we log it but still return 200 so the
   customer always sees a confirmation (the front end also offers a
   call / mailto fallback when this endpoint is unreachable).

   Supabase table (create when ready):
     create table bookings (
       id bigint generated always as identity primary key,
       created_at timestamptz default now(),
       service text, service_id text, price text, duration int,
       date date, date_label text, "time" text,
       name text, phone text, email text, notes text, source text,
       deposit_amount int default 0, deposit_status text, payment_intent text
     );

   Optional EmailJS env vars:
     EMAILJS_SERVICE_ID
     EMAILJS_TEMPLATE_ID   (or EMAILJS_BOOKING_TEMPLATE_ID to use a dedicated template)
     EMAILJS_PRIVATE_KEY
*/

const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';
const STUDIO_EMAIL = 'thomascollinshs@gmail.com';

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

  const { service, service_id, price, duration, date, date_label, time, name, phone, email, notes, source } = data;
  if (!name || !phone || !service || !date || !time) {
    return res.status(400).send('Missing required fields');
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  try {
    const sb = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        service, service_id, price,
        duration: duration ? parseInt(duration, 10) : null,
        date, date_label, time, name, phone, email,
        notes: notes || '', source: source || 'web',
      }),
    });
    if (!sb.ok) errors.push(`Supabase: ${await sb.text()}`);
  } catch (e) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2. Email the studio via EmailJS ─────────────── */
  try {
    const ejServiceId  = process.env.EMAILJS_SERVICE_ID;
    const ejTemplateId = process.env.EMAILJS_BOOKING_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
    const ejPrivateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (ejServiceId && ejTemplateId && ejPrivateKey) {
      const summary =
        `New booking request\n\n` +
        `Service:  ${service} (${price || ''})\n` +
        `Date:     ${date_label || date} at ${time}\n` +
        `Name:     ${name}\n` +
        `Phone:    ${phone}\n` +
        `Email:    ${email || '—'}\n` +
        `Notes:    ${notes || '—'}`;

      const ej = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:  ejServiceId,
          template_id: ejTemplateId,
          user_id:     ejPrivateKey,
          template_params: {
            to_email:   STUDIO_EMAIL,
            from_name:  name,
            from_email: email || STUDIO_EMAIL,
            reply_to:   email || STUDIO_EMAIL,
            subject:    `Booking — ${service} — ${date_label || date} ${time}`,
            service, price, date: date_label || date, time,
            phone, notes: notes || '',
            message: summary,
          },
        }),
      });
      if (!ej.ok) errors.push(`EmailJS: ${await ej.text()}`);
    }
  } catch (e) {
    errors.push(`EmailJS exception: ${e.message}`);
  }

  if (errors.length > 0) console.error('book errors:', errors);

  return res.status(200).json({ success: true, warnings: errors });
};
