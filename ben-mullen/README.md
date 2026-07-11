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
- **Structure** — fixed `mix-blend-mode: difference` nav → full-bleed **static**
  hero (single image) with the practice statement → intro statement →
  **Selected Projects** two-column masonry (each card links to its own detail
  page) → **About** (dark, full bio) → **Awards & Recognition** accordion →
  black contact footer.
- **Motion** — IntersectionObserver scroll-reveal. Respects
  `prefers-reduced-motion`.

### Project detail pages — `project.html`

One templated page renders every project from an embedded data object, read via
`?p=<slug>` (`kilmantin-road`, `the-fall`, `otium`, `the-old-boathouse`,
`dysart`). Each card on the index links here. A detail page shows the title, a
facts panel (type / venue / year / credits / award), the project write-up, a
full image gallery and prev/next navigation. An unknown slug falls back to the
first project.

All copy is **ben mullen architects' own** — projects, write-ups, bio, awards
and contact are taken from the practice's own material; only the *visual layout*
is modelled on the reference site.

## Content (all his own)

- **Practice** — based in Wicklow, Ireland; MRIAI; accredited in conservation at
  grade 3. Bio, statement and project write-ups are the practice's own.
- **Projects (selected)** — the five with photography to hand, each with a full
  detail page:
  - **Kilmantin Road** — Residential — Design · Self-build · Project Management —
    2021–2024 · **AAI Award 2025**
  - **The Fall** — Exhibition — Royal Hibernian Academy, Dublin · Art of Architecture Pavilion 2025
  - **OTIUM** — Exhibition — The Architecture Centre, RIAI, Dublin
  - **The Old Boathouse** — Conservation — an 1865 protected structure, Wicklow · ongoing
  - **Dysart Drawings** — Exhibition — drawings · ongoing, 2023
- **Awards** (accordion, each with a note on the awarding body) — RIAI Emerging
  Architect Award 2025 · AAI Award 2025 · Art of Architecture Pavilion (RHA) 2025 ·
  Eileen Gray E-1027 Research Fellowship 2023.
- **Contact** — office@benmullen.ie · +353 85 126 9885 · Wicklow House, Market
  Square, Wicklow, A67 W589

> Rose Cottage (listed on benmullen.ie) is held back — no photography was
> available. Add `rose-cottage-*.jpg`, a card on the index and an entry in the
> `PROJECTS` array in `project.html` to reinstate it.

## Images

Real project photography lives in `ben-mullen/img/`, taken from the practice's
own material. Each `<img>` keeps a labelled hatched placeholder behind it, so a
missing/renamed file degrades gracefully instead of showing a broken image.

- `hero-01.jpg` — static hero (Kilmantin Road interior)
- `about-01.jpg` — About (studio / exhibition wall)
- Per-project galleries: `kilmantin-01…06`, `the-fall-01…05`, `otium-01…05`,
  `boathouse-01…02`, `dysart-01…05` — the first of each is the index-card image.

To swap any photograph, replace the file of the same name (optimised JPG/WebP,
long edge ~2000px) — no code change needed. Gallery order is set by the `imgs`
array for each project in `project.html`.
