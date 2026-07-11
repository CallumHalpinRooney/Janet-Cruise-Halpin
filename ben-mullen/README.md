# ben mullen architects — website

Single-page site for **ben mullen architects**, a practice working with
architecture and landscape design across Ireland (buildings, conservation and
exhibition work). Served at `/ben-mullen/` on the same Vercel deployment as the
rest of the repo.

## Design

**Modelled 1:1 on the layout and design language of [kononenkogroup.com](https://kononenkogroup.com/)**
— the "systematic clarity" minimalism of an architecture bureau:

- **Canvas** — near-white paper (`#fff` / `#f4f4f2`), black type, a single grey
  (`#929292`) for secondary text, hairline rules. One inverted black section
  (About) for contrast, and a black contact footer.
- **Type** — `Inter` (grotesque sans) carries nav, labels and body; `Newsreader`
  (light serif) is used only for the large statements — mirroring Kononenko's
  sans + serif pairing.
- **Structure** — fixed `mix-blend-mode: difference` nav → full-bleed hero
  slideshow with the practice statement → intro statement → **Selected Projects**
  staggered grid → feature (image + text) → **About** (dark, SAUL bio) →
  **Recognition** list → black contact footer.
- **Motion** — IntersectionObserver scroll-reveal + a slow hero crossfade.
  Respects `prefers-reduced-motion`.

All copy is **ben mullen architects' own** (projects, scope, awards, bio,
contact) — only the *visual layout* is modelled on the reference site.

## Content (all real, from benmullen.ie)

- **Statement** — "The practice works with architecture and landscape design to
  address environmental concerns as the primary aesthetic problems of our time."
- **Projects**
  - **Kilmantin Road** — Buildings — Design · Self-build · Project Management —
    2021–2024 · **AAI Award 2025**
  - **Rose Cottage** — Buildings — Design · Planning · Tender · Construction — 2023–present
  - **The Old Boathouse** — Buildings — Design · Conservation · Specification — A Protected Structure
  - **Olivemount Road** — Buildings — Design · Planning · Tender · Construction Management
  - **OTIUM** — Exhibitions — Design · Installation
  - **The Fall** — Exhibitions — Competition · Detailed Design — Art of Architecture Pavilion 2025, RHA
- **About** — Graduate of SAUL, School of Architecture University of Limerick.
- **Contact** — office@benmullen.ie · +353 85 126 9885

## Images  ⚠️ needed

The photographs on his current site (benmullen.ie) are served through the Cargo
CMS as a JavaScript slideshow and **could not be pulled automatically** in this
environment. Until the real photos are dropped in, every image slot shows a
labelled hatched placeholder — the site is fully laid out and presentable, it
just needs the real photography.

Drop the files into `ben-mullen/img/` with these exact names and they appear
automatically (no code change needed):

| File | Used for | Suggested crop |
|------|----------|----------------|
| `hero-01.jpg`, `hero-02.jpg`, `hero-03.jpg` | hero slideshow | wide / full-bleed |
| `kilmantin-01.jpg`, `kilmantin-02.jpg` | Kilmantin Road (grid + feature) | 4:3 and 5:6 |
| `rose-cottage-01.jpg` | Rose Cottage (tall card) | 3:4 |
| `boathouse-01.jpg` | The Old Boathouse | 4:3 |
| `olivemount-01.jpg` | Olivemount Road | 4:3 |
| `otium-01.jpg` | OTIUM (tall card) | 3:4 |
| `the-fall-01.jpg` | The Fall | 4:3 |
| `about-01.jpg` | About portrait | 4:5 |

Save as optimised JPG/WebP (long edge ~2000px). If a name is missing the slot
just falls back to its placeholder, so images can be added one at a time.
