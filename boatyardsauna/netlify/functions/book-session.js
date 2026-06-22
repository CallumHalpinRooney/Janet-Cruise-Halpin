/* Netlify Function — book-session.js
   Receives a booking from the website, stores it, and emails the team so a
   booking is NEVER lost. Mirrors the existing submit-inquiry.js pattern.

   Optional env vars (add in Netlify → Site settings → Environment variables):
     SUPABASE_URL, SUPABASE_KEY          → store bookings in a "bookings" table
     EMAILJS_SERVICE_ID                  → email the team a new-booking alert
     EMAILJS_TEMPLATE_ID
     EMAILJS_PRIVATE_KEY
   Everything is optional: with nothing configured the function still returns
   200 and the front-end falls back to a pre-filled email, so the business
   always gets the booking.
*/

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let b;
  try {
    b = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!b.email || !b.firstName || !b.session || !b.date || !b.time) {
    return { statusCode: 400, body: 'Missing required booking fields' };
  }

  const errors = [];

  /* ── 1. Store in Supabase (optional) ───────────────────── */
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          location: b.location,
          session: b.session,
          booking_date: b.date,
          booking_time: b.time,
          guests: b.guests,
          addons: (b.addons || []).join(', '),
          total: b.total,
          first_name: b.firstName,
          last_name: b.lastName,
          email: b.email,
          phone: b.phone,
          notes: b.notes,
        }),
      });
      if (!res.ok) errors.push(`Supabase: ${await res.text()}`);
    } catch (e) {
      errors.push(`Supabase exception: ${e.message}`);
    }
  }

  /* ── 2. Email the team via EmailJS (optional) ──────────── */
  const ejServiceId = process.env.EMAILJS_SERVICE_ID;
  const ejTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const ejPrivateKey = process.env.EMAILJS_PRIVATE_KEY;
  if (ejServiceId && ejTemplateId && ejPrivateKey) {
    try {
      const summary =
        `${b.session} at ${b.location}\n` +
        `${b.dateLabel || b.date} at ${b.time}\n` +
        `${b.guests} guest(s)\n` +
        `Extras: ${(b.addons || []).join(', ') || 'none'}\n` +
        `Total: €${b.total}`;
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: ejServiceId,
          template_id: ejTemplateId,
          user_id: ejPrivateKey,
          template_params: {
            from_name: `${b.firstName} ${b.lastName || ''}`.trim(),
            from_email: b.email,
            phone: b.phone,
            booking_summary: summary,
            notes: b.notes || '',
            reply_to: b.email,
          },
        }),
      });
      if (!res.ok) errors.push(`EmailJS: ${await res.text()}`);
    } catch (e) {
      errors.push(`EmailJS exception: ${e.message}`);
    }
  }

  if (errors.length) console.error('book-session warnings:', errors);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, warnings: errors }),
  };
};
