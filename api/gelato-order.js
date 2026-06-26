// Forwards a print order to Gelato. (Vercel serverless)
//
// Setup (Vercel dashboard → Project → Settings → Environment Variables):
//   GELATO_API_KEY = your Gelato API key

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const response = await fetch('https://order.gelatoapis.com/v4/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.GELATO_API_KEY,
      },
      body: rawBody,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
