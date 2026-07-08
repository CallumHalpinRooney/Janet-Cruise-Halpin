# Thomas Collins Hair Studio — website

Premium single-page site for **Thomas Collins Hair Studio**, 101 Rathgar Road,
Dublin 6 (D06 VX72). Served at `/thomas-collins/` on the same deployment as the
rest of this repo (Vercel).

The design is a close match to **ever.co.id**, rebranded for Thomas Collins:

- **Palette** lifted from the reference — beige `#f9f6f1`, warm golds
  (`#9b754d` / `#7a6047` / `#96846f`) and near-black warm dark sections that
  alternate with the beige as you scroll.
- **Type** — an elegant serif display (Fraunces, standing in for the reference's
  Bradford) paired with a light uppercase sans (Jost, for Maax).
- **Section flow**: hero → "about the studio" intro → a **numbered 01–06
  services carousel** → studio collage → pull-quote → "ready when you are" →
  prices → gallery → our story → the **booking list** (kept low on purpose, so
  visitors get a feel for the studio before booking) → FAQ → find us.
- **Motion** uses the same libraries ever.co.id runs, self-hosted in `vendor/`:
  **Lenis** (smooth momentum scroll), **GSAP** + **SplitType** (headings that
  rise in character by character). A single IntersectionObserver drives every
  reveal, and everything degrades gracefully (plain, in-place content) if the
  scripts are unavailable or the visitor prefers reduced motion.

## Adding real photos (recommended)

The page ships with elegant warm placeholders so it looks complete out of the
box. To use real photography, just drop image files into **this folder** named
to match — the page detects them on load and swaps them in automatically, no
code changes needed:

| File name        | Where it appears                          |
|------------------|-------------------------------------------|
| `hero.jpg`       | Full-screen hero background               |
| `intro.jpg`      | "Understated Hair" portrait               |
| `services.jpg`   | Beside the numbered booking list          |
| `cat-1…4.jpg`    | The services carousel — Cuts / Blow-Dries & Styling / Colour & Highlights / Balayage & Treatments |
| `art-1…4.jpg`    | "The Art of Beautiful Hair" collage       |
| `quote.jpg`      | Behind the pull-quote                      |
| `feature.jpg`    | "Your Moment of Transformation" card      |
| `gallery-1…7.jpg`| Gallery grid                              |
| `story.jpg`      | "Our Story" portrait                      |

Use warm, well-lit shots (JP/WEBP, ~1600px on the long edge) for the closest
match to the reference mood. Landscape works for `hero`/`feature`/`quote`,
portrait for the rest.

### Logo

The nav/footer use a styled-text wordmark. To use the real black-and-cream "TC"
monogram, that's a design choice we can wire in — supply the artwork as
`logo.svg` (best) or a transparent `logo.png` and let us know.

## Editing services, prices & opening hours

Everything is data-driven near the top of the `<script>` block in `index.html`:

- `SERVICES` — the list that powers the booking rows, the price list and the
  booking service picker. Edit names, tags, durations (used to generate time
  slots) and prices in one place.
- `HOURS` — opening hours per weekday (`0` = Sunday … `6` = Saturday; `null` =
  closed). These drive which days and times the booking calendar offers.
- `FAQS` — the FAQ accordion.

> Prices are sensible placeholders — **confirm against the studio's real price
> list before go-live.**

## Booking system

The "Make an Appointment" flow is a five-step panel (service → date → time →
details → confirm). It posts to `/api/book` (Vercel) — mirrored by
`netlify/functions/book.js` for Netlify.

To capture bookings server-side:

1. **Supabase** — create a `bookings` table (SQL is in `api/book.js`). Requests
   are stored automatically once the table exists.
2. **Email** (optional) — set `EMAILJS_SERVICE_ID`, `EMAILJS_PRIVATE_KEY` and
   either `EMAILJS_BOOKING_TEMPLATE_ID` or `EMAILJS_TEMPLATE_ID` in the host's
   environment variables to have each request emailed to
   `thomascollinshs@gmail.com`.

Until then the endpoint still returns success and the customer sees a
confirmation, with a one-tap **email / call fallback** so no booking is ever
lost. The flow is fully client-side for availability (the studio confirms each
request), which keeps it fast and reliable.
