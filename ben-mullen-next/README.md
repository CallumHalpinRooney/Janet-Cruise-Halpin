# ben mullen architects

A bespoke Next.js (App Router) site for the practice — architecture, landscape
and conservation, Wicklow, Ireland. Content-driven and restrained: the work is
the hero.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — a custom architectural system (see `tailwind.config.ts`)
- **next/image** for all photography
- **next/font** — Archivo (neo-grotesque) + Spectral (serif), deliberately not Inter
- **Resend** for the enquiry form (`/api/contact`)
- One subtle scroll reveal (`components/Reveal.tsx`); no carousels, no
  slideshows, respects `prefers-reduced-motion`

## Structure (nothing deeper than three clicks)

| Route | Page |
| --- | --- |
| `/` | Home — hero, positioning, featured projects |
| `/projects` | The full body of work |
| `/projects/[slug]` | Project detail — images + write-up (statically generated) |
| `/about` | The practice, awards, studio |
| `/contact` | Enquiry form (Resend) + Instagram |

## Content

All copy and photography is the practice's own, carried over into typed data:

- `data/projects.ts` — every project, write-up, fact and image
- `data/site.ts` — statement, bio, awards, studio strip, contact

Images live in `public/images/` and videos in `public/videos/`.

## Run it locally

```bash
cd ben-mullen-next
npm install
cp .env.example .env.local   # add the Resend key when ready (optional for dev)
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## The enquiry form

`/api/contact` posts through Resend. It's stubbed: with no `RESEND_API_KEY` it
fails cleanly with a clear message (never silently drops an enquiry). To make it
live, set in `.env.local`:

```
RESEND_API_KEY=...            # from https://resend.com/api-keys
CONTACT_TO_EMAIL=office@benmullen.ie
CONTACT_FROM_EMAIL=enquiries@benmullen.ie   # a verified Resend sender
```

## Notes / to complete

- **Rose Cottage** is intentionally omitted — no photography was available.
  Add `rose-cottage-*.jpg` and a `Project` entry in `data/projects.ts` to
  reinstate it.
- The **About** page speaks for the practice and Ben Mullen from the harvested
  material. If a second named principal should be featured, add their bio to
  `data/site.ts`.
