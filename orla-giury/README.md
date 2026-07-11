# Orla Giury — website

Single-page landing site for **Orla Giury**, a small Irish artist who makes
intricate hand-drawn Celtic line art (trees of life, hearts, swans, knotwork)
and sells across Etsy, Pinterest, Facebook & Instagram. The site is the front
door: it shows the work and points visitors to her socials and email.

Served at `/orla-giury/` on the same Vercel deployment as the rest of the repo.

## Design

Modelled on the minimalist, editorial feel of **pell-mell.fr** — generous
whitespace, hairline rules, a quiet cream canvas and a warm terracotta accent.

- **Vibe** — the brand leans into Orla's earth / nature / wellness world
  (the "Greystones sea-swim" audience): a full-bleed Irish-coast sunset hero,
  a coastal atmosphere band, a plant image in About. Her line-art is the
  jewellery; nature imagery sets the mood.
- **Type** — Fraunces (light serif display) + Jost (uppercase sans labels).
- **Signature interaction** — the *Selected work* section is a hover-reveal
  **index**: hovering a row dims the rest and shows that piece **large in the
  centre of the screen** (over a soft veil), matching the reference site. On
  touch devices there's no hover, so the **curated grid** just below is the
  primary way to browse the work.
- **Sections**: hero (sunset) → about the artist (nature + remembrance theme)
  → selected work (5 curated pieces) → atmosphere band → where to find the work
  (Etsy / Instagram / Pinterest / Facebook) → contact (commissions; email + a
  form that opens the visitor's mail app) → footer.
- Copy subtly carries the made-for-someone / keepsake / remembrance thread
  (commissions with a name, date or few words hidden in the pattern).
- Motion is a single IntersectionObserver reveal; everything degrades to plain
  in-place content with `prefers-reduced-motion`.

## ⚠️ Placeholders to swap when the real details arrive

Everything the client still needs to supply is in **one place** — the `CONFIG`
object near the bottom of `index.html`:

```js
const CONFIG = {
  email: "hello@orlagiury.com",   // ← Orla's real email
  socials: [
    { name: "Etsy",      ..., url: "https://www.etsy.com/" },      // ← real shop URL
    { name: "Instagram", ..., url: "https://www.instagram.com/" }, // ← real profile URL
    { name: "Pinterest", ..., url: "https://www.pinterest.com/" }, // ← real profile URL
    { name: "Facebook",  ..., url: "https://www.facebook.com/" }   // ← real page URL
  ]
};
```

Edit those five values and the shop cards, footer links, the big email link and
the contact form (which opens a pre-filled email) all update automatically —
no other changes needed.

## Images

Taken from Orla's own social posts, cropped / optimised for the web:

- `hero.jpg` — Irish-coast sunset (full-bleed hero background)
- `band.jpg` — golden sea sunset (atmosphere band)
- `about.jpg` — monstera leaf (About)
- `work-tree`, `work-rainbow`, `work-flower`, `work-feathers`, `work-gold`
  — the five curated artwork pieces

To swap or add a work, drop a square `.jpg` into `art/` and reference it in the
`WORKS` array (grid) and the `.index-row` markup (hover index) in `index.html`.
To change the mood images, just replace `hero.jpg` / `band.jpg` / `about.jpg`.
