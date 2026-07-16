// Stripe webhook → Gelato fulfilment. (Vercel serverless)
//
// This is the SINGLE, authoritative fulfilment path. When Stripe confirms a
// payment, Stripe calls this endpoint; we verify the signature, then create the
// Gelato print order server-side. Because it runs on Stripe's event (not in the
// customer's browser), an order can never be lost to a closed tab — and because
// the browser no longer creates Gelato orders, there are no duplicates.
//
// Setup (Vercel dashboard → Project → Settings → Environment Variables):
//   STRIPE_WEBHOOK_SECRET = whsec_...   (from the Stripe webhook endpoint)
//   GELATO_API_KEY        = your Gelato API key   (already set)
//
// In Stripe: Developers → Webhooks → Add endpoint
//   URL:    https://<your-domain>/api/stripe-webhook
//   Events: payment_intent.succeeded
//
// No npm packages: signature verification uses Node's built-in crypto, exactly
// as Stripe's SDK does internally.

const crypto = require('crypto');

// ── Server-side fulfilment maps (keep in sync with index.html) ───────────────
// Museum-Quality Matte Paper Poster (250gsm uncoated archival). UIDs verified
// against the live Gelato catalog.
const PRODUCT_UIDS = {
  '30x30': 'flat_300x300-mm-12x12-inch_250-gsm-100lb-uncoated-offwhite-archival_4-0_ver',
  '40x40': 'flat_400x400-mm-16x16-inch_250-gsm-100lb-uncoated-offwhite-archival_4-0_ver',
  '60x42': 'flat_a2_250-gsm-100lb-uncoated-offwhite-archival_4-0_ver',
};
const ARTWORK_FILES = {
  'blue-mantel':     'https://res.cloudinary.com/dqguffxvg/image/upload/Blue_Mantel_100x70cm_12in_1_2_je2tuu',
  'stone-gap':       'https://res.cloudinary.com/dqguffxvg/image/upload/Stone_at_Gap_70x70cm_9in_gp7hye',
  'petals-on-green': 'https://res.cloudinary.com/dqguffxvg/image/upload/Petals_on_Green_80x80cm_9in_xity7b',
  'breeze':          'https://res.cloudinary.com/dqguffxvg/image/upload/Breeze_70x70cm_9in_cgkkc2',
  'leaf-and-water':  'https://res.cloudinary.com/dqguffxvg/image/upload/Leaf_and_Water_100x100cm_9in_tyy6qi',
  'just-summer':     'https://res.cloudinary.com/dqguffxvg/image/upload/Just_Summer_M-100x100cm_Websize_yasi3v',
  'blue-falls':      'https://res.cloudinary.com/dqguffxvg/image/upload/Blue_Falls_M-100x70cm_Websize_bhrlzm',
};
const COUNTRY_MAP = { IE: 'IE', GB: 'GB', EU: 'DE', US: 'US', AU: 'AU', WW: 'IE' };

// 'order' auto-produces on payment (charges Janet's Gelato card immediately) —
// Janet does nothing, prints ship automatically. 'draft' would require her to
// click produce for each order in the Gelato dashboard.
const GELATO_ORDER_TYPE = 'order';

const SIG_TOLERANCE_SECONDS = 300; // reject events older than 5 minutes (replay guard)

async function readRawBody(req) {
  // If Vercel already handed us the raw body as a Buffer/string, use it as-is —
  // re-reading the stream after parsing would yield nothing and break signature
  // verification. Only fall back to draining the stream when body is absent.
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Verify the Stripe-Signature header. Returns true if any v1 signature matches
// and the timestamp is within tolerance.
function verifySignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = header.split(',').map(p => p.trim());
  const tPart = parts.find(p => p.startsWith('t='));
  if (!tPart) return false;
  const timestamp = tPart.slice(2);
  const v1s = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!v1s.length) return false;

  // Replay guard
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (!Number.isFinite(age) || Math.abs(age) > SIG_TOLERANCE_SECONDS) return false;

  const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  const expBuf = Buffer.from(expected, 'utf8');
  return v1s.some(v => {
    const vBuf = Buffer.from(v, 'utf8');
    return vBuf.length === expBuf.length && crypto.timingSafeEqual(vBuf, expBuf);
  });
}

// Parse the machine-readable cart from PaymentIntent metadata.fulfil:
// "id~size~qty|id~size~qty"  (size itself contains 'x', e.g. 30x30)
function parseFulfil(str) {
  return (str || '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const [id, size, qty] = s.split('~');
      return { id, size, qty: parseInt(qty, 10) || 1 };
    })
    .filter(it => it.id && it.size);
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const gelatoKey = process.env.GELATO_API_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET not set' });

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (e) {
    return res.status(400).send('Could not read body');
  }

  if (!verifySignature(raw, req.headers['stripe-signature'], secret)) {
    // Diagnostic (safe — no secret leaked). bodyBytes ~0 means Vercel parsed the
    // body and the raw bytes were lost; a full bodyBytes with a header present
    // means the STRIPE_WEBHOOK_SECRET doesn't match this endpoint.
    return res.status(400).json({
      error: 'Invalid signature',
      bodyBytes: Buffer.isBuffer(raw) ? raw.length : String(raw).length,
      hasSigHeader: !!req.headers['stripe-signature'],
    });
  }

  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch (e) {
    return res.status(400).send('Invalid JSON');
  }

  // Acknowledge everything we don't act on so Stripe stops resending it.
  if (event.type !== 'payment_intent.succeeded') {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const pi = event.data.object || {};
  const md = pi.metadata || {};
  const ship = pi.shipping || {};
  const addr = ship.address || {};

  const items = parseFulfil(md.fulfil).map((it, i) => ({
    itemReferenceId: `item-${i}-${it.id}-${it.size}`,
    productUid: PRODUCT_UIDS[it.size],
    quantity: it.qty,
    files: [{ type: 'default', url: ARTWORK_FILES[it.id] || `https://res.cloudinary.com/dasjyomdb/image/upload/${it.id}.png` }],
  })).filter(it => it.productUid);

  if (!items.length) {
    console.error('webhook: no fulfillable items for', pi.id, 'metadata=', md);
    return res.status(200).json({ received: true, note: 'no fulfillable items' });
  }

  if (!gelatoKey) {
    console.error('webhook: GELATO_API_KEY not set — cannot fulfil', pi.id);
    return res.status(200).json({ received: true, note: 'gelato key missing' });
  }

  const nameParts = (ship.name || md.name || 'Valued Customer').trim().split(/\s+/);
  const firstName = nameParts.shift() || 'Valued';
  const lastName = nameParts.join(' ') || 'Customer';
  const email = md.email || pi.receipt_email || '';

  const payload = {
    orderReferenceId: pi.id, // one Gelato order per PaymentIntent
    customerReferenceId: email,
    currency: 'EUR',
    orderType: GELATO_ORDER_TYPE,
    shippingAddress: {
      firstName,
      lastName,
      addressLine1: addr.line1 || '',
      addressLine2: addr.line2 || undefined,
      city: addr.city || '',
      postCode: addr.postal_code || '',
      country: COUNTRY_MAP[md.shipping] || addr.country || 'IE',
      email,
      phone: ship.phone || undefined,
    },
    items,
    metadata: { paymentIntentId: pi.id, source: 'stripe-webhook' },
  };

  try {
    const gres = await fetch('https://order.gelatoapis.com/v4/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': gelatoKey },
      body: JSON.stringify(payload),
    });
    const gdata = await gres.json().catch(() => ({}));
    if (!gres.ok) {
      // Permanent data error (e.g. bad UID): ack with 200 so Stripe doesn't retry
      // for days; it's logged for manual handling. Transient/5xx: 500 → Stripe retries.
      console.error('webhook: Gelato order failed', gres.status, JSON.stringify(gdata));
      if (gres.status >= 500) return res.status(500).json({ error: 'gelato 5xx' });
      return res.status(200).json({ received: true, gelato: 'rejected', detail: gdata });
    }
    console.log('webhook: Gelato order created', gdata.id, 'for', pi.id);
    return res.status(200).json({ received: true, gelatoOrderId: gdata.id });
  } catch (e) {
    console.error('webhook: Gelato call threw', e.message);
    return res.status(500).json({ error: e.message }); // 500 → Stripe retries
  }
}

// Exposed for offline unit tests.
handler.verifySignature = verifySignature;
handler.parseFulfil = parseFulfil;

module.exports = handler;
// Tell Vercel not to pre-parse the body — we need the raw bytes Stripe signed.
// This MUST be set on module.exports directly (not just on `handler`) for
// Vercel's build to statically detect it and actually disable body parsing.
module.exports.config = { api: { bodyParser: false } };
