# Herzog & de Meuron homepage — design-study replica

A dependency-free HTML/CSS/JS replica of the herzogdemeuron.com homepage
layout, typography, and behavior. All images and editorial text are labeled
placeholders; commercial fonts are substituted with system stacks.
Not affiliated with the studio.

* `DESIGN_NOTES.md` — the measured spec (Phase 1) + QA results (Phase 3)
* `index.html`, `css/styles.css`, `js/app.js` — the build (Phase 2)

Open `index.html` in a browser, or serve the folder:
`python3 -m http.server` → http://localhost:8000/

## Inline editing

The floating **Edit** button (bottom-right) toggles edit mode:

* click any text (titles, chips, menu items, captions…) and retype it
* click any gray placeholder to upload your own image (an × button removes it)
* **Download** saves the current state as a standalone HTML file that can be
  reopened and edited again

The editor toolbar is a replica-only addition — it is not part of the
original site's design.
