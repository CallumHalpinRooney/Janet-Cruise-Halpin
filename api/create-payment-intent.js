// Creates a Stripe PaymentIntent for the current cart. (Vercel serverless)
//
// SECURITY: the order total is calculated HERE, on the server, from a trusted
// price list — never from the amount the browser sends. This stops anyone
// editing the page from paying the wrong price.
//
// Setup (Vercel dashboard → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY = sk_live_...   (or sk_test_... while testing)

// ── Trusted price list (must match SIZE_PRICE in index.html) ─────────────────
// Square canvases print at 30x30 or 40x40; rectangular works at a single 60x42 (A2).
const SIZE_PRICE = { '30x30': 60, '40x40': 70, '60x42': 95 };
const SHIPPING   = { IE: 5, GB: 8, EU: 7, US: 12, AU: 15, WW: 15 };

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { items = [], shippingCode = 'IE', email = '', name = '', phone = '', address = {} } = payload;
    // Map the site's shipping code to an ISO-2 country for the Stripe shipping object.
    const ISO = { IE: 'IE', GB: 'GB', EU: 'DE', US: 'US', AU: 'AU', WW: 'IE' };

    // Recompute the total from trusted per-size prices
    let total = 0;
    for (const it of items) {
      const unit = SIZE_PRICE[it.size];
      const qty = parseInt(it.qty, 10);
      if (unit == null || !(qty > 0)) {
        return res.status(400).json({ error: `Invalid cart item: ${it.id} ${it.size}` });
      }
      total += unit * qty;
    }
    total += SHIPPING[shippingCode] != null ? SHIPPING[shippingCode] : SHIPPING.WW;

    if (total <= 0) {
      return res.status(400).json({ error: 'Empty or invalid order.' });
    }

    // ── €1 TEST OVERRIDE ─────────────────────────────────────────────────────
    // When TEST_PAY_TOKEN is set in Vercel AND the checkout sent the matching
    // token (site opened with ?testpay=<token>), charge €1 instead of the real
    // total so the whole flow can be tested cheaply. Everything else — metadata,
    // shipping, the Gelato webhook — is unchanged. Delete the TEST_PAY_TOKEN env
    // var (or just don't use the URL) to switch this off completely.
    const testToken = process.env.TEST_PAY_TOKEN;
    if (testToken && payload.testToken && payload.testToken === testToken) {
      total = 1;
    }

    const amount = Math.round(total * 100); // Stripe works in cents

    const body = new URLSearchParams();
    body.append('amount', String(amount));
    body.append('currency', 'eur');
    body.append('payment_method_types[]', 'card');
    if (email) body.append('receipt_email', email);

    // Human-readable summary (shows in the Stripe dashboard).
    body.append('metadata[items]', items.map(i => `${i.id}:${i.size}x${i.qty}`).join(', ').slice(0, 480));
    body.append('metadata[shipping]', shippingCode);
    if (email) body.append('metadata[email]', email.slice(0, 200));
    if (name)  body.append('metadata[name]', name.slice(0, 200));
    // Machine-readable cart the webhook uses to build the Gelato order.
    // Format: id~size~qty|id~size~qty  (size may contain 'x', e.g. 30x30)
    body.append('metadata[fulfil]', items.map(i => `${i.id}~${i.size}~${i.qty}`).join('|').slice(0, 480));

    // Attach the shipping address to the PaymentIntent so the webhook can fulfil
    // without the browser. (Stripe stores this as first-class shipping data.)
    if (address && (address.line1 || name)) {
      if (name)  body.append('shipping[name]', name);
      if (phone) body.append('shipping[phone]', phone);
      body.append('shipping[address][line1]', address.line1 || '');
      if (address.line2) body.append('shipping[address][line2]', address.line2);
      body.append('shipping[address][city]', address.city || '');
      body.append('shipping[address][postal_code]', address.postcode || '');
      body.append('shipping[address][country]', ISO[shippingCode] || 'IE');
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      return res.status(stripeRes.status).json({ error: data.error ? data.error.message : 'Stripe error' });
    }

    return res.status(200).json({ clientSecret: data.client_secret, amount, currency: 'eur' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
