/* Vercel serverless — print-enquiry.js
   Receives print enquiries and contact messages from the Phil McDarby site
   (/phil-mcdarby/). Lead capture only — no payments: Phil quotes and fulfils
   every print personally through his own printer/framer.

   On each submission:
     1. Store the enquiry in Supabase (print_enquiries) so Phil has a real,
        dashboard-able record — not just an inbox.
     2. Email Phil via Resend with all details + which piece.
     3. Send the buyer a polite confirmation.
   A submission only counts as delivered if it was stored OR Phil's email
   went out — the buyer's confirmation alone is not delivery. On total
   failure we return 502 so the front end shows an honest retry instead of
   silently dropping a lead.

   Anti-abuse: the artwork is identified by slug and validated against the
   allowlist below (regenerate from phil-mcdarby/js/works-data.js when works
   change); title and image URL are derived server-side, never taken from
   the request, so the endpoint can't be used to compose phishing emails
   from Phil's sender. Free-text fields are length-capped. A hidden
   honeypot field silently swallows bot submissions.

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
     SITE_ORIGIN          — optional, used to build artwork image URLs in emails
*/

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';
const SITE_ORIGIN  = process.env.SITE_ORIGIN || 'https://janet-cruise-halpin-xpgs.vercel.app';

// Generated from phil-mcdarby/js/works-data.js — slug → title.
const WORKS = {"the-amber-dragons-hoard":"The Amber Dragon’s Hoard","a-dance-of-light":"A Dance of Light","the-wood-dragon-the-cricket":"The Wood Dragon & The Cricket","the-moss-dragon-at-amberfall":"The Moss Dragon at Amberfall","auri":"Auri","heart-of-the-glade":"Heart Of The Glade","the-green-man-awakens":"The Green Man Awakens","an-encounter-at-greenspindle":"An Encounter at Greenspindle","faerieholme":"Faerieholme","luring-the-draccus":"Luring The Draccus","caamora":"Caamora","dryad":"Dryad","dwelling":"Dwelling","elemend":"Elemend","exiles-return":"Exile’s Return","fathom":"Fathom","fathom-ii":"Fathom (II)","gift":"Gift","imagine":"Imagine","magic":"Magic","monolith":"Monolith","the-cave-where-az-dg":"The Cave Where AZ & DG","the-crypt-of-floating-caskets":"The Crypt of Floating Caskets","the-future-is-bright":"The Future is Bright","the-gloaming-born":"The Gloaming Born","the-greenwood-deep":"The Greenwood Deep","the-loom":"The Loom","the-moss-dragon-the-butterfly":"The Moss Dragon & The Butterfly","the-twins":"The Twins","the-wood-dragon-the-ladybird":"The Wood Dragon & The Ladybird","the-wood-dragon-the-spiders-lair":"The Wood Dragon & The Spider’s Lair","triptych":"Triptych","wayland":"Wayland","wonder":"Wonder","autumn-in-ravensdale":"Autumn in Ravensdale","benbulbin":"Benbulbin","dragonfly":"Dragonfly","forest-lake":"Forest Lake","glencree-ii":"Glencree (II)","gleninchaquin-park":"Gleninchaquin Park","glowing-valley":"Glowing Valley","hillside":"Hillside","ladys-view":"Lady’s View","lough-melvyn":"Lough Melvyn","lough-teagh-panorama":"Lough Teagh Panorama (I)","lough-teagh-panorama1":"Lough Teagh Panorama (II)","moss-stump":"Moss & Stump","mountaintop-puddle-i":"Mountaintop Puddle (I)","mountaintop-puddle-ii":"Mountaintop Puddle (II)","mushroom":"Mushroom","mushrooms":"Mushrooms","sun-through-trees":"Sun Through Trees","sunlit-woods":"Sunlit Woods","sunrise-at-castlemartyr":"Sunrise at Castlemartyr","the-black-valley":"The Black Valley","the-gap-of-dunloe":"The Gap of Dunloe","the-gap-of-dunloe-ii":"The Gap of Dunloe II","the-glen-of-aherloe":"The Glen of Aherloe","the-pass":"The Pass","tomies-wood":"Tomie’s Wood","treestump-in-sunlight":"Treestump in Sunlight (II)","treestump-in-sunlight1":"Treestump in Sunlight (I)"};

const PRINT_SIZES = ['A3', 'A2', 'A1', 'Large format / custom'];
const FRAMINGS    = ['Not sure yet', 'Yes — framed', 'No — print only'];
const SUBJECTS    = ['A print enquiry', 'A commission', 'Something else'];

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const cap = (v, n) => String(v == null ? '' : v).slice(0, n).trim();
const pick = (v, list) => (list.includes(v) ? v : '');

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

  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (data.website) {
    return res.status(200).json({ success: true });
  }

  const type    = data.type === 'contact' ? 'contact' : 'print';
  const name    = cap(data.name, 120);
  const email   = cap(data.email, 200);
  const message = cap(data.message, 4000);
  const size    = pick(data.size, PRINT_SIZES);
  const framing = pick(data.framing, FRAMINGS);
  const subject = pick(data.subject, SUBJECTS);
  const page    = cap(data.page, 300);

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Missing required fields');
  }

  // Artwork identity comes from the allowlist, never from request text.
  let workSlug = '', workTitle = '', workImage = '';
  if (type === 'print') {
    workSlug = cap(data.work_slug, 80);
    workTitle = WORKS[workSlug];
    if (!workTitle) return res.status(400).send('Unknown artwork');
    workImage = `${SITE_ORIGIN}/phil-mcdarby/img/${workSlug}.jpg`;
  } else if (!message) {
    return res.status(400).send('Missing message');
  }

  const errors = [];

  /* ── 1. Store in Supabase ───────────────────────── */
  let stored = false;
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
        work_title: workTitle, work_slug: workSlug, work_image: workImage,
        size, framing, page,
      }),
    });
    if (sb.ok) stored = true;
    else errors.push(`Supabase: ${await sb.text()}`);
  } catch (e) {
    errors.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2 + 3. Email Phil, confirm to the buyer (Resend) ── */
  const resendKey = process.env.RESEND_API_KEY;
  const philEmail = process.env.PHIL_EMAIL;
  const from = process.env.RESEND_FROM || 'Phil McDarby Enquiries <onboarding@resend.dev>';
  let philNotified = false;

  const sendEmail = async (label, payload) => {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (r.ok) return true;
      errors.push(`Resend ${label}: ${await r.text()}`);
    } catch (e) {
      errors.push(`Resend ${label} exception: ${e.message}`);
    }
    return false;
  };

  if (resendKey && philEmail) {
    const isPrint = type === 'print';
    const heading = isPrint ? `Print enquiry — ${workTitle}` : `Contact message — ${subject || 'General'}`;

    const rows = [
      ['Name', name],
      ['Email', email],
      isPrint && ['Artwork', workTitle],
      isPrint && ['Print size', size || '—'],
      isPrint && ['Framing', framing || '—'],
      !isPrint && ['Regarding', subject || '—'],
      ['Message', message || '—'],
      ['Sent from', page],
    ].filter(Boolean).map(([k, v]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#888;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`
    ).join('');

    philNotified = await sendEmail('to Phil', {
      from,
      to: [philEmail],
      reply_to: email,
      subject: heading,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px">
          <h2 style="font-weight:normal">${esc(heading)}</h2>
          ${isPrint ? `<img src="${esc(workImage)}" alt="${esc(workTitle)}" style="max-width:280px;margin:8px 0 16px">` : ''}
          <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>
        </div>`,
    });

    // Buyer confirmation is a courtesy — its failure never fails the request,
    // and its success never counts as delivery of the lead.
    await sendEmail('confirmation', {
      from,
      to: [email],
      subject: isPrint ? `Your print enquiry — ${workTitle}` : 'Your message to Phil McDarby',
      html: `
        <div style="font-family:Georgia,serif;max-width:560px">
          <h2 style="font-weight:normal">Thank you, ${esc(name)}.</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#444">
            ${isPrint
              ? `Your enquiry about a fine-art print of <strong>${esc(workTitle)}</strong>${size ? ` (${esc(size)})` : ''} has been received. Phil will be in touch personally to discuss sizes, papers, framing and pricing, and to arrange your print.`
              : 'Your message has been received. Phil will be in touch personally.'}
          </p>
          ${isPrint ? `<img src="${esc(workImage)}" alt="${esc(workTitle)}" style="max-width:280px;margin:8px 0">` : ''}
          <p style="font-family:Arial,sans-serif;font-size:12px;color:#999">Phil McDarby — digital artist, photographer &amp; composer, Dublin, Ireland.</p>
        </div>`,
    });
  } else {
    errors.push('Resend not configured (RESEND_API_KEY / PHIL_EMAIL missing).');
  }

  if (errors.length > 0) console.error('print-enquiry errors:', errors);

  // Delivered = stored for Phil to see, or landed in Phil's inbox.
  if (!stored && !philNotified) {
    return res.status(502).json({ success: false });
  }
  return res.status(200).json({ success: true });
};
