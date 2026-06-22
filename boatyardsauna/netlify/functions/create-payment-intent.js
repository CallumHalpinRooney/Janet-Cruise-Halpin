// Creates a Stripe PaymentIntent for a booking deposit.
//
// SECURITY: the deposit amount is fixed HERE on the server (DEPOSIT_AMOUNT),
// never trusted from the browser — so nobody can edit the page to pay €0.
//
// Setup (Netlify → Site settings → Environment variables):
//   STRIPE_SECRET_KEY = sk_live_...   (or sk_test_... while testing)
//   DEPOSIT_AMOUNT    = 10            (optional; euros; defaults to 10)
//
// Must match CONFIG.deposit.amount in index.html. No npm packages needed.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' }) };
  }

  try {
    const { description = 'Sauna deposit', email = '' } = JSON.parse(event.body || '{}');

    const deposit = parseInt(process.env.DEPOSIT_AMOUNT, 10) || 10; // euros, fixed server-side
    const amount = Math.round(deposit * 100); // cents

    const body = new URLSearchParams();
    body.append('amount', String(amount));
    body.append('currency', 'eur');
    body.append('payment_method_types[]', 'card');
    body.append('description', String(description).slice(0, 200));
    if (email) body.append('receipt_email', email);

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
