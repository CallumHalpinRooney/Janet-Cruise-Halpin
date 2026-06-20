// Creates a Stripe PaymentIntent for the current cart.
//
// SECURITY: the order total is calculated HERE, on the server, from a trusted
// price list — never from the amount the browser sends. This stops anyone
// editing the page from paying the wrong price.
//
// Setup (in the Netlify dashboard → Site settings → Environment variables):
//   STRIPE_SECRET_KEY = sk_live_...   (or sk_test_... while testing)
//
// No npm packages required — this calls Stripe's API directly.

// ── Trusted price list (must match the catalogue in index.html) ──────────────
const PRICES = {
  'mayloom': 95, 'canopy': 95, 'touching-green': 95, 'sweet-summer': 85,
  'dancing': 85, 'moon-tree': 75, 'red-leaf': 85, 'shades-of-evening': 80,
  'land-edge': 80, 'aurora': 80, 'fragrant-blossoms': 80, 'favourite-perfume': 85,
  'as-i-remember': 85, 'happy-talk': 85, 'maitree': 85, 'tall-story': 85,
  'blossom-dearie': 85, 'shadowed-nature': 85, 'breeze': 75, 'patterns': 80,
  'woods-in-mist': 85, 'little-green': 75, 'blue-mantel': 80, 'just-summer': 85,
  'blue-falls': 80, 'small-wilderness': 85, 'leaf-and-water': 85, 'true-green': 95,
  'last-summer': 80, 'petals-on-green': 80, 'holly-and-beech': 80, 'cool-mountain': 90,
  'synergos-1': 75, 'synergos-2': 75, 'gliding-light': 80, 'stone-gap': 75,
  'west-alone': 65, 'dusk': 75, 'mist-of-sea': 80,
};
const SIZE_ADDON = { A3: 0, A2: 25, A1: 60 };
const SHIPPING   = { IE: 0, GB: 12, EU: 18, US: 28, AU: 32, WW: 35 };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' }) };
  }

  try {
    const { items = [], shippingCode = 'IE', email = '' } = JSON.parse(event.body || '{}');

    // Recompute the total from trusted prices
    let total = 0;
    for (const it of items) {
      const base = PRICES[it.id];
      const addon = SIZE_ADDON[it.size];
      const qty = parseInt(it.qty, 10);
      if (base == null || addon == null || !(qty > 0)) {
        return { statusCode: 400, body: JSON.stringify({ error: `Invalid cart item: ${it.id} ${it.size}` }) };
      }
      total += (base + addon) * qty;
    }
    total += SHIPPING[shippingCode] != null ? SHIPPING[shippingCode] : SHIPPING.WW;

    if (total <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Empty or invalid order.' }) };
    }

    const amount = Math.round(total * 100); // Stripe works in cents

    // Create the PaymentIntent via Stripe's REST API
    const body = new URLSearchParams();
    body.append('amount', String(amount));
    body.append('currency', 'eur');
    body.append('payment_method_types[]', 'card');
    if (email) body.append('receipt_email', email);
    body.append('metadata[items]', items.map(i => `${i.id}:${i.size}x${i.qty}`).join(', ').slice(0, 480));
    body.append('metadata[shipping]', shippingCode);

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.error ? data.error.message : 'Stripe error' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: data.client_secret, amount, currency: 'eur' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
