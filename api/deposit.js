/* Vercel serverless — deposit.js
   Booking deposit for Thomas Collins Hair Studio via Stripe Checkout.

   Two actions (POST JSON):
     • default : create a Checkout Session for the deposit and return { url }.
                 The full booking is carried in the session metadata — it is
                 NOT written to the database until the payment succeeds.
     • confirm : { action:'confirm', session_id } — after the customer returns
                 from Stripe, verify the session is paid, then record the
                 booking (deposit_status = 'paid') and email the studio.

   The deposit AMOUNT is fixed here on the server (never trust the browser).

   Setup (Vercel → Project → Settings → Environment Variables):
     STRIPE_SECRET_KEY = sk_live_...   (or sk_test_... while testing)
     DEPOSIT_EUR       = 10            (optional; defaults to 10)
   Optional email to the studio (same as book.js):
     EMAILJS_SERVICE_ID, EMAILJS_PRIVATE_KEY,
     EMAILJS_BOOKING_TEMPLATE_ID (or EMAILJS_TEMPLATE_ID)
*/

const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';
const STUDIO_EMAIL = 'thomascollinshs@gmail.com';
const DEPOSIT_EUR  = parseInt(process.env.DEPOSIT_EUR, 10) || 10;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const SK = process.env.STRIPE_SECRET_KEY;
  if (!SK) return res.status(500).json({ error: 'not_configured' });

  let p;
  try { p = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch { return res.status(400).json({ error: 'Invalid JSON' }); }

  const stripePost = (path, params) => fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SK}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const stripeGet = (path) => fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { 'Authorization': `Bearer ${SK}` },
  });

  try {
    /* ── CONFIRM: verify payment, then store the booking ── */
    if (p.action === 'confirm') {
      if (!p.session_id) return res.status(400).json({ error: 'Missing session_id' });
      const r = await stripeGet(`checkout/sessions/${encodeURIComponent(p.session_id)}`);
      const s = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: s.error ? s.error.message : 'Stripe error' });

      const paid = s.payment_status === 'paid';
      if (!paid) return res.status(200).json({ paid: false });

      const m = s.metadata || {};
      await recordBooking({
        service: m.service, service_id: m.service_id, price: m.price,
        duration: m.duration, date: m.date, date_label: m.date_label, time: m.time,
        name: m.name, phone: m.phone, email: m.email || s.customer_email || '',
        notes: m.notes, source: m.source || 'thomas-collins-web',
        deposit_amount: DEPOSIT_EUR, deposit_status: 'paid',
        payment_intent: s.payment_intent || '',
      });
      return res.status(200).json({ paid: true });
    }

    /* ── CREATE: a Checkout Session for the deposit ── */
    const { service = '', service_id = '', price = '', duration = '',
            date = '', date_label = '', time = '', name = '', phone = '',
            email = '', notes = '', source = 'thomas-collins-web', origin = '' } = p;
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const base = origin || `https://${req.headers.host}`;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', 'eur');
    params.append('line_items[0][price_data][unit_amount]', String(DEPOSIT_EUR * 100));
    params.append('line_items[0][price_data][product_data][name]', `Booking deposit — ${service}`.slice(0, 127));
    if (date_label || time) params.append('line_items[0][price_data][product_data][description]', `${date_label} ${time}`.trim().slice(0, 200));
    params.append('line_items[0][quantity]', '1');
    if (email) params.append('customer_email', email);
    // carry the booking on the session so we only store it once paid
    const meta = { service, service_id, price, duration: String(duration || ''),
      date, date_label, time, name, phone, email,
      notes: (notes || '').slice(0, 480), source, kind: 'tc-deposit' };
    for (const k in meta) params.append(`metadata[${k}]`, String(meta[k] || ''));
    params.append('success_url', `${base}/thomas-collins/?deposit=success&s={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url',  `${base}/thomas-collins/?deposit=cancelled`);

    const r = await stripePost('checkout/sessions', params);
    const s = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: s.error ? s.error.message : 'Stripe error' });
    return res.status(200).json({ url: s.url, id: s.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/* Insert into Supabase + optionally email the studio (mirrors book.js). */
async function recordBooking(b) {
  const errors = [];
  try {
    const sb = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        service: b.service, service_id: b.service_id, price: b.price,
        duration: b.duration ? parseInt(b.duration, 10) : null,
        date: b.date, date_label: b.date_label, time: b.time,
        name: b.name, phone: b.phone, email: b.email, notes: b.notes || '',
        source: b.source, deposit_amount: b.deposit_amount,
        deposit_status: b.deposit_status, payment_intent: b.payment_intent || '',
      }),
    });
    if (!sb.ok) errors.push(`Supabase: ${await sb.text()}`);
  } catch (e) { errors.push(`Supabase exception: ${e.message}`); }

  try {
    const id = process.env.EMAILJS_SERVICE_ID;
    const tpl = process.env.EMAILJS_BOOKING_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
    const key = process.env.EMAILJS_PRIVATE_KEY;
    if (id && tpl && key) {
      const summary =
        `New booking (deposit paid)\n\n` +
        `Service:  ${b.service} (${b.price || ''})\n` +
        `Date:     ${b.date_label || b.date} at ${b.time}\n` +
        `Name:     ${b.name}\nPhone:    ${b.phone}\nEmail:    ${b.email || '—'}\n` +
        `Deposit:  €${b.deposit_amount} paid\nNotes:    ${b.notes || '—'}`;
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: id, template_id: tpl, user_id: key,
          template_params: {
            to_email: STUDIO_EMAIL, from_name: b.name,
            from_email: b.email || STUDIO_EMAIL, reply_to: b.email || STUDIO_EMAIL,
            subject: `Booking (deposit paid) — ${b.service} — ${b.date_label || b.date} ${b.time}`,
            service: b.service, price: b.price, date: b.date_label || b.date, time: b.time,
            phone: b.phone, notes: b.notes || '', message: summary,
          },
        }),
      });
    }
  } catch (e) { errors.push(`EmailJS exception: ${e.message}`); }

  if (errors.length) console.error('deposit recordBooking errors:', errors);
}
