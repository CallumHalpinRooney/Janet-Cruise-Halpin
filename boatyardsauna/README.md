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
The site already points at these filenames. **Just drop the matching files into
`assets/` and they appear automatically** — no code change needed. Until a file
exists, the site falls back to on-brand stock imagery, so it never looks broken.

The hero is a **scroll-scrubbed video** (`assets/hero.mp4`) — as you scroll, the
clip plays through, like the sample's frame sequence. `assets/hero.jpg` is its
poster/fallback frame (also used for social sharing). To change the hero clip,
drop a new `assets/hero.mp4` (keep it short, muted, ~720p/1080p, `+faststart`).

| File in `assets/` | Used for | Best photo |
|---|---|---|
| `hero.mp4` | Full-screen scroll-scrubbed hero video | The harbour clip |
| `hero.jpg` | Hero poster + social image + gallery | A strong still frame |
| `sauna-interior.jpg` | "Wood-fired sauna" feature + gallery | Inside the sauna — stove + window onto the sea |
| `sauna-exterior.jpg` | Gallery (large tile) | The timber-clad sauna cabin |
| `beach.jpg` | "The cold dip" feature + gallery | The beach / seafront |
| `harbour-evening.jpg` | "Evenings in the harbour" feature + gallery | Evening in the harbour (orange boat) |

Use landscape JPGs around 1600px wide (hero ~2000px). To add more photos or
change the mapping, edit the `PHOTO = { … }` block at the top of the `<script>`
in `index.html`.

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
