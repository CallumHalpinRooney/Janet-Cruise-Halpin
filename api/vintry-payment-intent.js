// Creates a Stripe PaymentIntent for a Vintry order. (Vercel serverless)
//
// SECURITY: the order total is recomputed HERE, on the server, from this
// trusted price list — never from the amount the browser sends. Editing the
// page in a browser cannot change what a customer is charged.
//
// Setup (Vercel dashboard → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY = sk_live_...   (or sk_test_... while testing)
// And in vintry/index.html set window.VINTRY_STRIPE_PK to your pk_live_/pk_test_ key.
//
// Prices are in EUR. They MUST stay in sync with the `CATALOG` array in
// vintry/index.html (same ids, same prices).

const PRICES = {
  // Champagne & Sparkling
  'dom-perignon-2015': 295, 'bollinger-special-cuvee': 80, 'veuve-clicquot-yellow': 72,
  'moet-imperial': 70, 'taittinger-nocturne': 70, 'alexandre-bonnet-bdn': 69,
  'prestige-des-sacres-bdb': 50, 'jean-pernet': 50, 'nua-prosecco': 25,
  'villa-jolanda-prosecco': 24, 'sant-anna-prosecco': 15,
  // Red
  'chiarlo-barolo-magnum': 295, 'beaucastel-cdp-2021': 135, 'narbantons-savigny-2020': 100,
  'dame-de-montrose-2017': 68, 'mont-redon-cdp-2020': 57, 'cloudy-bay-pinot-2018': 48,
  'frank-phelan-2017': 45, 'jaboulet-cdp-2020': 43, 'vina-alberdi-rioja-2019': 26.5,
  'carpineto-chianti-2022': 25, 'the-ned-pinot-2021': 24,
  // White
  'grenouilles-grand-cru-2019': 115, 'santenay-st-aubin-2021': 68, 'vaulorent-chablis-2020': 67,
  'defaix-chablis-2010': 66, 'cloudy-bay-sb-2022': 40, 'greywacke-sb-2022': 29,
  'geoffroy-verger-2022': 28, 'kim-crawford-sb-2022': 24, 'kono-sb': 20,
  'lawsons-sb': 20, 'cloud-factory-sb-2023': 17, 'ned-sb-2023': 16,
  // Port & Fortified
  'infantado-vintage-2011': 89, 'kopke-20yr-tawny': 57, 'dow-bomfim-2010': 49,
  'casal-jordoes-ruby': 33, 'kopke-10yr-tawny': 32, 'kopke-lbv-2015': 27,
  'kopke-fine-white': 22, 'kopke-fine-ruby': 20,
  // Spirits
  'blue-spot-7yr': 100, 'gunpowder-gin': 50, 'dingle-gin': 40,
  // Beer & Cider
  'longueville-cider': 5.5, 'hollows-ginger-beer': 4.75, 'mcivors-cider': 4.35,
  'craigies-ballyhook': 3.95,
};

// Delivery — must match the options in the checkout UI.
const DELIVERY = { collect: 0, dublin: 7, ireland: 12 };
const FREE_DELIVERY_THRESHOLD = 150; // Dublin/Ireland delivery free over this (excl. collect, which is always free)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payments are not configured yet (missing STRIPE_SECRET_KEY).' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { items = [], delivery = 'collect', email = '' } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your basket is empty.' });
    }

    let subtotal = 0;
    for (const it of items) {
      const unit = PRICES[it.id];
      const qty = parseInt(it.qty, 10);
      if (unit == null || !(qty > 0) || qty > 99) {
        return res.status(400).json({ error: `Item unavailable: ${it.id}` });
      }
      subtotal += unit * qty;
    }

    let ship = DELIVERY[delivery];
    if (ship == null) ship = DELIVERY.collect;
    if (delivery !== 'collect' && subtotal >= FREE_DELIVERY_THRESHOLD) ship = 0;

    const total = subtotal + ship;
    if (total <= 0) {
      return res.status(400).json({ error: 'Invalid order total.' });
    }

    const amount = Math.round(total * 100); // Stripe works in cents

    const body = new URLSearchParams();
    body.append('amount', String(amount));
    body.append('currency', 'eur');
    body.append('payment_method_types[]', 'card');
    if (email) body.append('receipt_email', email);
    body.append('description', 'The Vintry, Rathgar — wine order');
    body.append('metadata[items]', items.map(i => `${i.id}x${i.qty}`).join(', ').slice(0, 480));
    body.append('metadata[delivery]', delivery);
    body.append('metadata[subtotal]', String(subtotal));

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
      return res.status(stripeRes.status).json({ error: data.error ? data.error.message : 'Payment error' });
    }

    return res.status(200).json({
      clientSecret: data.client_secret,
      amount, subtotal, shipping: ship, currency: 'eur',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
