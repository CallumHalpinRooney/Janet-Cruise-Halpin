# The Vintry — website

Premium storefront for The Vintry, 102 Rathgar Road, Dublin 6.
Served at `/vintry/` on the same Netlify site.

## Using the real logo (recommended for an exact match)

The hero/nav/footer currently show a styled-text version of the wordmark.
To use the shop's **actual logo artwork** instead — for a true one-to-one
match — just add the file to this folder:

- Save it as **`logo.svg`** (best — stays sharp at any size) or **`logo.png`**
  (use a transparent background, ~600px+ wide).
- That's it. The page detects the file on load and swaps it in everywhere
  automatically — no code changes needed.

If you only have the logo from the old website, open the old site, right-click
the logo → *Save image as…*, or ask whoever built it for the original
SVG/vector file.

> Tip: the logo is terracotta on transparent, which sits well on the light
> hero and nav. The footer is dark green — if you want the logo there too,
> supply a cream/white version and tell me, and I'll point the footer at it.

## Payments (Stripe)

- Set your **publishable** key in `index.html` → `window.VINTRY_STRIPE_PK`.
- Set the matching **secret** key in Netlify → Site settings → Environment
  variables → `STRIPE_SECRET_KEY`.
- Order totals are recomputed server-side in
  `netlify/functions/vintry-payment-intent.js` from a trusted price list.

## Catalogue

Products and prices live in two places that must stay in sync:
- `index.html` → the `CATALOG` array (display)
- `netlify/functions/vintry-payment-intent.js` → `PRICES` (trusted totals)

Prices were recovered from the live vintry.ie listings and should be
verified against the shop's current pricing before go-live.
