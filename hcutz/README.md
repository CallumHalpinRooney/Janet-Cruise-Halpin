# HCUTZ — Barber Website & Booking

A clean, high-end one-page site for **HCUTZ** (Harry) — premium barbering in Ashford.
"Fresher the better."

## What's here
- `index.html` — the full website (single file, no build step, no dependencies).
- `logo.svg` — the HCUTZ brand mark, used as the favicon and throughout the site.

## Features
- Dark + gold premium theme, fully responsive (mobile → desktop).
- Booking buttons link straight to the live system: `https://hcutz09.simplybook.it/v2`.
- Sections: hero, services & pricing, about Harry, how-to-book, gallery, reviews,
  opening hours, and a final booking call-to-action.
- Scroll animations, sticky nav, mobile menu — no frameworks, loads instantly.

## How to view
Open `index.html` in any browser. That's it.

## Easy things to tweak (no code knowledge needed)
- **Prices / services** — find the `SERVICES` section in `index.html`; edit the names,
  the `£` prices and durations.
- **Opening hours** — find the `BOOK / HOURS` section and edit the times.
- **Photos** — the gallery currently uses the logo as placeholders. Swap each
  `<svg class="mk">…</svg>` for `<img src="your-photo.jpg" alt="">` to show real cuts.
- **Booking link** — search for `simplybook.it/v2` to update everywhere at once.
- **Instagram** — search for `instagram.com/h.cutz_09`.

## Deploy
Drop this folder onto Netlify, Vercel or GitHub Pages — it's static, so it just works.
