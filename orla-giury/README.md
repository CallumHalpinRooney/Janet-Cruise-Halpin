# Orla Giury — website

Single-page landing site for **Orla Giury**, a small Irish artist who makes
intricate hand-drawn Celtic line art (trees of life, hearts, swans, knotwork)
and sells across Etsy, Pinterest, Facebook & Instagram. The site is the front
door: it shows the work and points visitors to her socials and email.

Served at `/orla-giury/` on the same Vercel deployment as the rest of the repo.

## Design

Modelled on the minimalist, editorial feel of **pell-mell.fr** — generous
whitespace, hairline rules, a quiet cream canvas and a warm terracotta accent.

- **Type** — Fraunces (light serif display) + Jost (uppercase sans labels).
- **Signature interaction** — the *Selected work* section is a hover-reveal
  **index**: hovering a row dims the rest and floats that piece in near the
  cursor (exactly like the reference site). On touch devices there's no hover,
  so the **gallery grid** just below is the primary way to browse the work.
- **Sections**: hero → selected-work index + gallery → about the artist →
  where to find the work (Etsy / Instagram / Pinterest / Facebook) → contact
  (email + a form that opens the visitor's mail app) → footer.
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

## Artwork images

The pieces in `art/` were taken from Orla's own social posts and cropped /
optimised for the web. To swap or add a piece, drop a square `.jpg` into `art/`
and reference it in the `WORKS` array (gallery) and/or the `.index-row`
markup (hover index) in `index.html`.
