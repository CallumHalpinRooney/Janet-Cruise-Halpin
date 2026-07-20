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

## Shared editing (both people see the same version)

The **Publish** button saves the page's text and images to the shared store
(the same Supabase project this repo already uses). Anyone opening the page —
hosted or as the downloaded single file — automatically loads the latest
published version, and the page re-checks for updates every minute while not
in edit mode. Last publish wins; there is no live co-editing.

**One-time setup:** in the Supabase dashboard (project `lkwzyaygeqxfnmzekadj`),
open SQL Editor and run:

```sql
create table if not exists replica_state (
  id bigint generated always as identity primary key,
  state jsonb not null,
  created_at timestamptz not null default now()
);
alter table replica_state enable row level security;
create policy "replica anon read"  on replica_state for select to anon using (true);
create policy "replica anon write" on replica_state for insert to anon with check (true);
```

Until that table exists, Publish shows "Shared saving not set up yet" and the
page simply works locally. Uploaded photos are downscaled to ≤1600px JPEG
before publishing to keep saves small. Every publish adds a row (older rows
are kept as history); clear old rows in Supabase if the table grows large.
