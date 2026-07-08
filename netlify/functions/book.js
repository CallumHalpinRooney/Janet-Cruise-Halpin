/* Netlify Function — book.js
   Netlify twin of api/book.js (Vercel). Receives a booking request from
   the Thomas Collins Hair Studio site, stores it in Supabase and optionally
   emails the studio via EmailJS. Always returns 200 so the customer sees a
   confirmation; the front end offers a call / mailto fallback if unreachable.

   Supabase table `bookings` (create when ready) and optional EmailJS env
   vars are documented in api/book.js.
*/

const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';
const STUDIO_EMAIL = 'thomascollinshs@gmail.com';

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

  const { service, service_id, price, duration, date, date_label, time, name, phone, email, notes, source } = data;
  if (!name || !phone || !service || !date || !time) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
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
    if (!res.ok) errors.push(`Supabase: ${await res.text()}`);
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

      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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
      if (!res.ok) errors.push(`EmailJS: ${await res.text()}`);
    }
  } catch (e) {
    errors.push(`EmailJS exception: ${e.message}`);
  }

  if (errors.length > 0) console.error('book errors:', errors);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, warnings: errors }),
  };
};
