/* Vercel serverless — print-enquiry.js
   Receives print enquiries and contact messages from the Phil McDarby site
   (/phil-mcdarby/). Lead capture only — no payments: Phil quotes and fulfils
   every print personally through his own printer/framer.

   On each submission:
     1. Store the enquiry in Supabase (print_enquiries) so Phil has a real,
        dashboard-able record — not just an inbox.
     2. Email Phil via Resend with all details + which piece.
     3. Send the buyer a polite confirmation.
   Everything degrades gracefully: if a table or env var is missing we log it
   but still return 200 wherever a human's enquiry actually got through.

   Supabase table (create when ready):
     create table print_enquiries (
       id bigint generated always as identity primary key,
       created_at timestamptz default now(),
       type text,            -- 'print' | 'contact'
       name text, email text,
       work_title text, work_slug text, work_image text,
       size text, framing text, subject text,
       message text, page text
     );

   Env vars (Vercel dashboard → Project → Settings → Environment Variables):
     RESEND_API_KEY       — required for email to be sent
     PHIL_EMAIL           — where enquiries land (Phil's inbox)
     RESEND_FROM          — verified sender, e.g. "Phil McDarby <enquiries@philmcdarby.com>"
                            (defaults to Resend's onboarding sender for testing)
*/

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

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

  const {
    type = 'print', name, email, message = '', subject = '',
    work_title = '', work_slug = '', work_image = '',
    size = '', framing = '', page = '', website = '',
  } = data;

  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Missing required fields');
  }
  if (type === 'print' && !work_title) {
    return res.status(400).send('Missing artwork');
  }
  if (type === 'contact' && !message) {
    return res.status(400).send('Missing message');
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  try {
    const sb = await fetch(`${SUPABASE_URL}/rest/v1/print_enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        type, name, email, message, subject,
        work_title, work_slug, work_image, size, framing, page,
      }),
    });
    if (!sb.ok) errors.push(`Supabase: ${await sb.text()}`);
  } catch (e) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2 + 3. Email Phil, confirm to the buyer (Resend) ── */
  const resendKey = process.env.RESEND_API_KEY;
  const philEmail = process.env.PHIL_EMAIL;
  const from = process.env.RESEND_FROM || 'Phil McDarby Enquiries <onboarding@resend.dev>';
  let emailed = false;

  if (resendKey && philEmail) {
    const isPrint = type === 'print';
    const heading = isPrint ? `Print enquiry — ${work_title}` : `Contact message — ${subject || 'General'}`;

    const rows = [
      ['Name', name],
      ['Email', email],
      isPrint && ['Artwork', work_title],
      isPrint && ['Print size', size],
      isPrint && ['Framing', framing],
      !isPrint && ['Regarding', subject],
      ['Message', message || '—'],
      ['Sent from', page],
    ].filter(Boolean).map(([k, v]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#888;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`
    ).join('');

    const toPhil = {
      from,
      to: [philEmail],
      reply_to: email,
      subject: heading,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px">
          <h2 style="font-weight:normal">${esc(heading)}</h2>
          ${isPrint && work_image ? `<img src="${esc(work_image)}" alt="${esc(work_title)}" style="max-width:280px;margin:8px 0 16px">` : ''}
          <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>
        </div>`,
    };

    const toBuyer = {
      from,
      to: [email],
      subject: isPrint ? `Your print enquiry — ${work_title}` : 'Your message to Phil McDarby',
      html: `
        <div style="font-family:Georgia,serif;max-width:560px">
          <h2 style="font-weight:normal">Thank you, ${esc(name)}.</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#444">
            ${isPrint
              ? `Your enquiry about a fine-art print of <strong>${esc(work_title)}</strong>${size ? ` (${esc(size)})` : ''} has been received. Phil will be in touch personally to discuss sizes, papers, framing and pricing, and to arrange your print.`
              : 'Your message has been received. Phil will be in touch personally.'}
          </p>
          ${isPrint && work_image ? `<img src="${esc(work_image)}" alt="${esc(work_title)}" style="max-width:280px;margin:8px 0">` : ''}
          <p style="font-family:Arial,sans-serif;font-size:12px;color:#999">Phil McDarby — digital artist, photographer &amp; composer, Dublin, Ireland.</p>
        </div>`,
    };

    for (const [label, payload] of [['to Phil', toPhil], ['confirmation', toBuyer]]) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`,
          },
          body: JSON.stringify(payload),
        });
        if (r.ok) emailed = true;
        else errors.push(`Resend ${label}: ${await r.text()}`);
      } catch (e) {
        errors.push(`Resend ${label} exception: ${e.message}`);
      }
    }
  } else {
    errors.push('Resend not configured (RESEND_API_KEY / PHIL_EMAIL missing) — enquiry stored only.');
  }

  if (errors.length > 0) console.error('print-enquiry errors:', errors);

  // The enquiry got through if we stored it or emailed it; only fail hard
  // when every channel failed — the front end then shows a graceful retry.
  const stored = !errors.some((e) => e.startsWith('Supabase'));
  if (!stored && !emailed) {
    return res.status(502).json({ success: false });
  }
  return res.status(200).json({ success: true, warnings: errors });
};
