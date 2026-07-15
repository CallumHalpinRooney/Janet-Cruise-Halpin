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

// ── Trusted price list (must match SIZE_PRICE in index.html) ─────────────────
// Square canvases print at 30x30 or 40x40; rectangular works at a single 60x40.
const SIZE_PRICE = { '30x30': 60, '40x40': 70, '60x40': 95 };
const SHIPPING   = { IE: 5, GB: 8, EU: 7, US: 12, AU: 15, WW: 15 };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' }) };
  }

  try {
    const { items = [], shippingCode = 'IE', email = '' } = JSON.parse(event.body || '{}');

    // Recompute the total from trusted per-size prices
    let total = 0;
    for (const it of items) {
      const unit = SIZE_PRICE[it.size];
      const qty = parseInt(it.qty, 10);
      if (unit == null || !(qty > 0)) {
        return { statusCode: 400, body: JSON.stringify({ error: `Invalid cart item: ${it.id} ${it.size}` }) };
      }
      total += unit * qty;
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
