# The Boat Yard Sauna — Website

A fast, on-brand single-page website with a built-in booking system and
installable-app (PWA) experience. Lives in its own folder and deploys as its own
Netlify site — completely separate from anything else in this repo.

```
boatyardsauna/
├── index.html                      # the whole site (HTML + CSS + JS)
├── manifest.webmanifest            # PWA manifest (installable app)
├── sw.js                           # service worker (offline / installable)
├── netlify.toml                    # deploy config (base dir = boatyardsauna)
├── netlify/functions/
│   └── book-session.js             # receives bookings → DB + email
├── assets/                         # icons + (your) real photos
└── STRATEGY.md                     # why this beats Linktree + the app
```

## Run it locally
Open `index.html` in a browser, or:
```bash
cd boatyardsauna && python3 -m http.server 8080
# visit http://localhost:8080
```

## Swap in real photos (most important step)
1. Drop your photos into `assets/` (e.g. `hero.jpg`, `sauna.jpg`, `dip.jpg`, …).
2. Open `index.html`, find the `const IMG = { … }` block near the top of the
   `<script>` and point each entry at your file:
   ```js
   const IMG = {
     hero:  'assets/hero.jpg',
     sauna: 'assets/sauna.jpg',
     dip:   'assets/dip.jpg',
     rest:  'assets/sunrise.jpg',
     g1: 'assets/g1.jpg', g2: 'assets/g2.jpg', g3: 'assets/g3.jpg',
     g4: 'assets/g4.jpg', g5: 'assets/g5.jpg',
   };
   ```
   Until you do, the site falls back to on-brand sea/sauna stock imagery.

## Deploy (Netlify)
1. New site from this repo → set **Base directory** to `boatyardsauna`.
2. Netlify reads `netlify.toml` automatically (publish `.`, functions in
   `netlify/functions`).
3. Point your domain (e.g. `theboatyardsauna.ie`) at the site.

### Make bookings land somewhere (optional but recommended)
Set these in **Netlify → Site settings → Environment variables**:

| Variable | What it does |
|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | Store every booking in a `bookings` table |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PRIVATE_KEY` | Email you instantly when a booking comes in |

With nothing set, the form still works — it falls back to opening a pre-filled
email to `hello@theboatyardsauna.ie`, so no booking is ever lost. Update that
address in `index.html` (`submitBooking()`) to your real inbox.

Suggested `bookings` table columns: `location, session, booking_date,
booking_time, guests, addons, total, first_name, last_name, email, phone, notes,
created_at`.

## Customise
- **Prices / sessions** → `sessions` array in `index.html`.
- **Add-ons** → `addonsList` array.
- **Locations** → `locations` array.
- **Reviews** → `testimonials` array.
- **Times** → `TIMES` array.

See `STRATEGY.md` for the full plan on beating the current Linktree + app setup.
