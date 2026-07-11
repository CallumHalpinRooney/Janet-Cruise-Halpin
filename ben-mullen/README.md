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

## Content (all his own)

- **Statement** — "The practice works with architecture and landscape design to
  address environmental concerns as the primary aesthetic problems of our time."
- **Projects (selected)** — the five with photography to hand:
  - **Kilmantin Road** — Buildings — Design · Self-build · Project Management —
    2021–2024 · **AAI Award 2025**
  - **The Fall** — Exhibitions — Competition · Detailed Design — Art of Architecture Pavilion 2025, RHA
  - **OTIUM** — Exhibitions — Design · Installation
  - **The Old Boathouse** — Buildings — Design · Conservation · Specification — A Protected Structure
  - **Dysart** — Buildings — Design · Drawings
- **About** — Graduate of SAUL, School of Architecture University of Limerick.
- **Contact** — office@benmullen.ie · +353 85 126 9885

> Rose Cottage and Olivemount Road (listed on benmullen.ie) are held back for
> now — no photography was available for them. Add images named
> `rose-cottage-01.jpg` / `olivemount-01.jpg` and copy an existing card block to
> reinstate them.

## Images

Real project photography lives in `ben-mullen/img/`, harvested from the client's
own material (his staging build + supplied shots). Each `<img>` keeps a labelled
hatched placeholder behind it, so a missing/renamed file degrades gracefully
rather than showing a broken image.

| File | Project / use |
|------|---------------|
| `hero-01/02/03.jpg` | hero crossfade — Kilmantin interior · The Fall · OTIUM |
| `kilmantin-01.jpg` | Kilmantin Road — timber window detail (index card) |
| `kilmantin-02.jpg` | Kilmantin Road — self-build interior (feature) |
| `the-fall-01.jpg` | The Fall — RHA installation |
| `otium-01.jpg` | OTIUM — installation |
| `boathouse-01.jpg` | The Old Boathouse — archival |
| `dysart-01.jpg` | Dysart — drawing |
| `about-01.jpg` | About — studio / exhibition wall |

To swap any photograph, replace the file of the same name (optimised JPG/WebP,
long edge ~2000px) — no code change needed.
