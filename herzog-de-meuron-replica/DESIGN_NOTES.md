# DESIGN_NOTES — herzogdemeuron.com (homepage)

## Inspection method & caveats

The live site (`https://www.herzogdemeuron.com/`) sits behind a WAF that blocks
datacenter traffic outright: every request from this environment gets an
infinite `302 → itself` redirect loop (curl) or a TCP connection reset
(Chromium). It could not be opened directly from here.

**Workaround used:** the Wayback Machine snapshot of **2026‑07‑13** (one week
old) was mirrored locally — the site's real `app.css` (168 KB), `app.js`
(607 KB, bundled), fonts, and full homepage HTML — then served on localhost and
inspected in headless Chromium at 1440 px, 768 px, and 390 px. All values below
are **computed styles from the site's own CSS/DOM**, not eyeballed. Screenshots
at all three widths were taken after two slow full-page scroll passes.

Flagged as *not fully inspectable* (see last section): live scroll-triggered
GSAP choreography timing, the custom-cursor's active size, video teasers
(none present in this snapshot's homepage), and any geo/session-dependent
content.

Stack detected: **WordPress** (custom theme by fertig design / Rasso Hilber),
**Alpine.js** (DOM behavior, `x-data` components: `Root`, `NormalizedGrid`,
global search), **GSAP 3.14.2 + ScrollTrigger** (bundled in app.js — word
reveal, grid FLIP animations), `lazysizes`-style lazy images (`data-srcset`,
`.lazyloaded`), jQuery (WordPress/Contact Form 7 only, not layout).

---

## Global design system

### Color palette (from `:root` in app.css)

| Token | Light | Dark (`prefers-color-scheme: dark`) |
|---|---|---|
| `--background` | `#fff` | `#111` |
| `--color` (text) | `#000` | `#eee` |
| `--transparent-low` | `rgba(0,0,0,0.075)` | white-based equivalent |
| `--transparent-high` | `rgba(0,0,0,0.5)` | white-based equivalent |
| `--color-gray` | `#888` | `#999` |
| `--color-error` | `hsl(0,100%,77%)` | same |
| `--color-success` | `hsl(150,100%,85%)` | same |
| Media placeholder | `var(--color)` at **8% opacity** (≈ `#ebebeb` on white) | same formula |

The site's own image placeholder (shown before lazy-load) is literally
`background: var(--color); opacity: .08` — our gray placeholder boxes reproduce
this exactly.

`--header-color: var(--color)` — wordmark/Menu can be switched to white when a
full-bleed dark hero is present (not on this snapshot's homepage).

### Typography

Three self-hosted font families (all commercial/custom — **not** included in
the replica; closest system fallbacks used and noted):

| Family (site) | Usage | Replica fallback stack |
|---|---|---|
| `Gravity` (ABC Gravity Normal, w400/700) — compressed grotesque | "H&dM" wordmark, "Menu" button | `"Arial Narrow", "Helvetica Neue Condensed", Impact, sans-serif` + `font-stretch: condensed` |
| `Geometric` (HdM Geometric Regular/Bold, custom) | Everything else (body, chips, captions, menu) | `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| `Suisse Works` (Bold) | Editorial serif accents (not on homepage top level) | `Georgia, serif` |

Scale (computed at 1440 px):

* `html`: `16px`; body: `Geometric 16px / 27.2px` (line-height **1.7**), color `#000`
* `.is-h1` (wordmark, Menu, search): `font-size: max(1.45rem, min(1.5vw, 1.6rem))` → **23.2px**, `line-height: 1.35` (31.32px). Wordmark/logo is **Gravity 700**; "Menu" is **Gravity 400**; search placeholder/input is **Geometric 700**.
* Chip nav (`.page-links`): `font-size: max(1.1rem, min(1.4vw, 1.3rem))` → **20.16px** desktop, **17.6px** (=1.1rem) at ≤1024; `line-height: 1.4` on the list, `line-height: 1` inside the pill.
* Card captions (`.postlist_item`): `.85rem` (13.6px) base → `1rem` (16px) at ≥667px; line-height 1.7.
* Menu overlay items: `Geometric 32px / 43.2px` (lh 1.35).
* Letter-spacing: `normal` everywhere. `text-transform: uppercase` only on card kickers (`.is-uppercase`).

### Spacing scale

One variable drives the whole page — **`--gap`**:

| Viewport | `--gap` |
|---|---|
| base (<667px) | `1.5rem` = 24px |
| ≥667px | `2rem` = 32px |
| ≥1800px | `3rem` = 48px |

Derived: `--half-gap` (= gap/2), `--double-gap` (= gap×2). Observed usage:
page side padding = `--gap` (32px desktop, 24px mobile); section
`margin-bottom` = `--double-gap` (64px); grid gutters = `--gap`/`--half-gap`;
header bottom padding = `--double-gap`.

### Breakpoints (all `min-width`, mobile-first)

`420px, 667px, 1024px, 1280px, 1480px, 1800px` (+ `hover:hover` media for
hover states, `pointer:coarse` for touch, `prefers-color-scheme: dark`).

### Other tokens

* `--duration: 300ms` (generic transitions); lazy-image fade `250ms ease-out`; hover caption overlay `150ms`.
* Border width `1px` solid `currentColor`; pill radius `2em`; modal radius `24px`; circle elements `border-radius: 1000px`/`100%`.

---

## Section: Header (`.site-title` + `.navigation_buttons`)

* **Layout:** `position: sticky; top: 0; z-index: 6`, full width, `display: flex`. Padding `var(--gap) var(--gap) var(--double-gap)` → 32/32/64 desktop, 24/24/48 mobile. Total height 128px desktop / 104px mobile. `pointer-events: none` on the bar (re-enabled on link/button) so content beneath stays clickable through its padding.
* **Wordmark:** left. `<h1>` "Herzog & de Meuron" is `sr-only`; visible span "H&dM", **Gravity 700, 23.2px**, black, 79×32px box. Links home.
* **Menu button:** `position: fixed` top-right (`top: 32px; right: 32px`), **Gravity 400 23.2px**, two spans "Menu"/"Close" swapped when overlay opens.
* **Scroll behavior:** wordmark and Menu stay pinned over the whole page (sticky/fixed). No shrink, no background — text floats over content.

## Section: Menu overlay (`.navigation_modal`)

* `position: fixed; inset: 0; z-index: 5`; **backdrop** `background: var(--background); opacity: .95` (95% white veil, dark-mode aware).
* Panel content: flex column, centered (`.is-centered`), padding `128px 32px`; three `module-menu-items` lists + two text modules; item font `Geometric 32px/43.2px`; module left margin 32px.
* Open/close animated with Alpine `x-transition` (opacity fade, ~300ms); "Menu" label switches to "Close".

## Section: Chip navigation (`.module-enhanced-page-links` → `ul.page-links`)

* **Layout:** flex, `flex-wrap: wrap`, `max-width: 1600px`; item spacing via `--items-gap: 0.6em` as right/bottom padding on each `li` (≈12.1px at desktop size); negative bottom margin on the ul cancels the last row's padding.
* **Pills (`.btn`):** `display: block; line-height: 1; white-space: nowrap; border: 1px solid; border-radius: 2em; padding: calc(.5em - 1px) calc(1em - 1px)` → 40px tall at desktop, 35px at ≤1024. Two styles:
  * primary (first 8 items): white bg, 1px black border
  * `data-style=secondary` (the rest + "…" toggle): `border-color: transparent; background: rgba(0,0,0,0.075)`
* **Hover/active (hover-capable devices):** instant invert — `background: var(--color); color: var(--background); border-color: var(--color)` (black pill, white text). No transition (snaps).
* **Items row 1 (always visible, outlined):** News, Projects, Practice, Exhibitions, Monographs, Writings, Lectures & Talks, Kabinett. **Filled:** Sustainability, Sport, Design Technologies, Academy, Interiors, Objects, Art Spaces, then a "…" toggle chip that expands the hidden remainder in place (JS; hidden when no JS).
* Section: side padding `--gap`, `margin-bottom: --double-gap` (64px).

## Section: Global search (`.module-global-search`)

* One-line fake-input, `is-h1` size: **Geometric 700, 23.2px/31.32px**.
* Placeholder row: `→` arrow icon (feather `arrow-right`, `1em`×`1em` ≈23px, `stroke-width: .095em`, margin-right .2em) + text "Search for something…" — pointer-events none, sits absolutely over a real `<input>` (transparent, same font). Placeholder text/icon color: black at reduced emphasis (gray ≈ `#888` visual).
* On focus/typing the placeholder hides; a clear "×" button appears when non-empty; results replace the modules below (`.has-results ~ .module { display: none }`).
* Section margins identical to chips (side `--gap`, bottom `--double-gap` = 64px → gap between search and first teaser is 96px total with teaser offset).

## Section: Large teasers (`.module-large-teasers`)

* Three stacked full-width teasers, vertical rhythm `margin-top: 64px` between grids (`.space-y-3`), section `margin-bottom: 64px`.
* Each teaser: `article.large-teaser` → `max-width: 1300px; margin-inline: auto` inside the `--gap`-padded 1376px container. Whole card is one `<a>` (`no-underline`).
* **Media:** `figure` with `--aspect-ratio` custom property; `.scaled-media` box uses `padding-bottom: calc(100% / var(--aspect-ratio))` and the 8%-black placeholder; `img` absolutely centered, `object-fit: contain` (`--object-fit` var), lazy-loaded (`opacity 0 → 1, 250ms ease-out`).
  * Teaser 1: landscape `--aspect-ratio: 1.3333` (4:3), source 2300×1725 → rendered 1300×975
  * Teaser 2: landscape 4:3, 1300×975 (news)
  * Teaser 3: portrait `--aspect-ratio: 0.7241` → rendered 1300-wide box, image contained ~1300×1795 (tall)
* **Caption** (`.postlist_item_text`, `padding-top: .8rem`, `text-align: center`):
  * kicker `.postlist_item_pointmark is-uppercase` — uppercase, 16px ("PROJECT" / "PROJECT UPDATE" / "NEWS")
  * `.postlist_item_title--long` — 16px (project number + name, e.g. "672 Mandarin Oriental Lago di Como, Restaurant L'ARIA"); `--short` variant (number only) hidden here
  * `.postlist_item_subtitle` (location) — hidden in this view
* **Hover:** title gets `text-decoration: underline` (offset .15em, 1px); if a secondary image exists it swaps in (`.postlist_item_image--secondary`, absolutely stacked, z-index 2).

## Section: Feed grid (`.module-related-posts` → `ul.postlist_items`)

* **Grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--min-column-width), 1fr))`
  * base: `--min-column-width: 50%` → **2 columns** (mobile, 183px each at 390px)
  * ≥667px: `min(33.33%, 280px)` → **3 columns** at 768px (245px each), **5 columns** at 1440px (281.6px each)
* Gutters via item padding `var(--gap) var(--half-gap)` (32/16 desktop, 24/12 mobile) + negative `--half-gap` side margins on the ul.
* **Cards:** same anatomy as teasers (aspect-ratio media box + centered caption below: uppercase kicker "NEWS"/"PROJECT"/"MONOGRAPH", 3-line-clamped title, hover underline + secondary-image swap). Mixed aspect ratios per item (landscape 4:3, square-ish, portrait) — the grid rows are laid out by an Alpine "NormalizedGrid" that keeps rows aligned; visual result is masonry-like but row-based.
* **Topic tile:** one circular tile ("Objects" / TOPIC) — a perfect circle (`border-radius: 100%`, 1px black border, white bg, label centered, Geometric), caption hidden (`.postlist--topic .postlist_item_text { display: none }` — the label lives inside the circle).
* **Infinite feed:** items load in batches as you approach the bottom (Alpine component tracks `endReached`); initial page ≈ 40 items, docHeight ≈ 9000px at 1440.
* Project-type grid pages (not homepage) hide captions and reveal them as a centered overlay on hover (`opacity 0, scale .9 → 1, 150ms`) — noted for completeness.

## Footer

**There is no footer.** `<main>` ends with `margin-bottom: 64px` (`.mb-3`) and
the document stops. (Legal/contact links live in the Menu overlay.)

## Standout components

* **Custom cursor** (`<custom-cursor>` element): fixed, white circle
  (`border-radius: 1000px`, `1px solid #000`, centered arrow SVG icon), shown
  over interactive media (galleries/modals; e.g. modal close, gallery
  next/prev). Hidden (0×0) at rest. Exact active diameter not observable in the
  static snapshot — replica uses 56px (flagged assumption).
* **Word-reveal animation:** headings/`.is-h1` text are split into `.word`
  spans; words fade in with GSAP using a **random-order stagger, amount =
  wordCount × 0.04s**, custom ease, then `clearProps: opacity,transform`.
  Non-revealed words are `opacity: 0`.
* **Lazy-image fade:** every image starts `opacity: 0` over the 8%-black
  placeholder and fades in `250ms ease-out` when loaded.
* **Modal dialogs:** `rgba(0,0,0,0.8)` backdrop, white body, `1px` black
  border, `24px` radius, 32px padding (print helper, forms).
* **View-transition page morphs** (`transition-main`) between routes — out of
  scope for a single-page replica.

## Image/video slot inventory (homepage snapshot)

| Slot | Count | Box (desktop) | Aspect | Notes |
|---|---|---|---|---|
| large-teaser 1 | 1 | 1300×975 | 4:3 (1.3333) | source 2300×1725 |
| large-teaser 2 | 1 | 1300×975 | 4:3 | news teaser |
| large-teaser 3 | 1 | ~1300×1795 | 0.7241 portrait | contained |
| feed cards | ~40 | 249.6 wide col, height varies | mix: 1.3333 / 1 / 0.75 / 0.6668 | 2 imgs per card (primary+hover secondary) |
| topic circle | 1 | ~250×250 | 1:1 circle | text-only tile |
| videos | 0 | — | — | none in this snapshot |

## Elements not fully inspectable (flagged, not guessed)

1. Live GSAP/ScrollTrigger scroll choreography timings — bundle is minified; word-reveal stagger (0.04s/word, random) and lazy fades were extractable, other scroll effects (if any beyond lazy reveal) were not observable in the archived copy.
2. Custom cursor active size/trigger set (element exists with full styling but stays 0×0 without live gallery/modal interaction).
3. Search results view (needs live backend).
4. Menu overlay item lists content beyond structure (three menu lists + two text blocks) — text content replaced with placeholders anyway.
5. Commercial fonts (ABC Gravity, HdM Geometric, Suisse Works) — identified exactly but not redistributable; system fallbacks used.

---

## Phase 3 QA — replica vs. original (measured side-by-side, same viewports)

| Metric | Original | Replica | Match |
|---|---|---|---|
| Header height / padding (1440) | 128px / 32 32 64 | 127px / 32 32 64 | ✓ |
| Wordmark size/weight | 23.2px / 700 | 23.2px / 700 | ✓ |
| Chip pill (1440) | 91×40, 20.16px, pad 9.08/19.16 | 91×40, 20.16px, pad 9.08/19.16 | ✓ exact |
| Chip pill (768/390) | 79×35, 17.6px | 79×35, 17.6px | ✓ exact |
| Search line (1440) | y=284, 23.2px/700 | y=284, 23.2px/700 | ✓ exact |
| Teaser 1 (1440) | x70 y380 1300×1042 | x70 y379 1300×1042 | ✓ |
| Teaser 1 (768) | x32 y459 704×595 | x32 y459 704×595 | ✓ exact |
| Feed columns (1440) | 281.594px ×5 | 281.594px ×5 | ✓ exact |
| Feed columns (768 / 390) | 245.33 ×3 / 183 ×2 | 245.33 ×3 / 183 ×2 | ✓ exact |
| Feed item padding | 32 16 (desktop), 24 12 (mobile) | same | ✓ |
| Mobile header | 104px / 24 24 48 | 103px / 24 24 48 | ✓ |

**Known deviations (accepted, font-metric-driven):**
* Without the commercial HdM Geometric/ABC Gravity faces, fallback glyph widths
  differ slightly: at 390px the chip rows wrap one extra line (~45px taller
  chips block); wordmark box is 67×26 vs 79×32. Everything token-driven
  (sizes, weights, spacing) is exact.
* Feed row heights vary with placeholder title length rather than real titles;
  column geometry and card anatomy are exact. Portrait tiles use a square
  normalized frame with the true-ratio "image" letterboxed inside, mirroring
  the original's NormalizedGrid output.
