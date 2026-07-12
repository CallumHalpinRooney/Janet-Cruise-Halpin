# Phil McDarby — Fine Art Portfolio + Print Enquiry Site

A private-gallery viewing room for the work of Phil McDarby — Dublin-based
digital artist, photographer and composer. Replaces the old PHP build at
philmcdarby.com. The images are the entire product: dark warm-charcoal canvas,
Cormorant Garamond + Inter, slow confident motion, no clutter.

## Pages

| Path | What it is |
|---|---|
| `/phil-mcdarby/` | Cinematic full-bleed hero (*A Dance of Light*), curated selected works, intro line |
| `/phil-mcdarby/gallery/` | All 62 works, editorial asymmetric grid, Digital Art / Photography filter |
| `/phil-mcdarby/work/?w=<slug>` | Single artwork — dominant image, lightbox, artist's note, print enquiry |
| `/phil-mcdarby/about/` | Phil's real bio (50+ awards, MediaLab Europe, Vyro Games, Illustrators Guild) |
| `/phil-mcdarby/contact/` | General contact / commission enquiries, same pipeline |

## The print enquiry flow (lead capture — deliberately NOT a shop)

Phil is a made-to-order fine-art operation with his own trusted printer and
framer, so there is **no cart, no checkout, no POD integration**. Each work has
an *Enquire about a print* button that opens a modal pre-filled with the
artwork. On submit, `/api/print-enquiry.js`:

1. stores the enquiry in Supabase (`print_enquiries` — SQL in the function header),
2. emails Phil via **Resend** with all details + the piece,
3. sends the buyer a polite confirmation.

### Env vars to set (Vercel → Settings → Environment Variables)

- `RESEND_API_KEY` — Resend API key
- `PHIL_EMAIL` — where enquiries land
- `RESEND_FROM` — verified sender, e.g. `Phil McDarby <enquiries@philmcdarby.com>`
  (defaults to Resend's onboarding sender until the domain is verified)

Create the `print_enquiries` table and set the env vars **before launch**. If
every channel fails (no table, no email config) the function returns 502 and
the form shows a graceful "try again" — an honest failure, never a silently
dropped lead. As long as at least one channel works, the visitor sees success
and partial errors are only logged.

## The enquiries dashboard (`admin/`)

`admin/index.html` is Phil's private viewing room for the pipeline — every
enquiry in one place, categorized. Same pattern as Janet's `/admin`: a
self-contained page that talks straight to Supabase, deployable as its own
private site (set the base directory to `phil-mcdarby/admin`; all artwork and
fonts are absolute URLs so it works standalone).

What it does:

- **Stat tiles** — Total / New / Replied / Fulfilled at a glance
- **Filters** — by status, by type (prints vs contact messages), by artwork
- **Cards** — artwork thumbnail, buyer name + click-to-reply email, size,
  framing, message, date
- **Status pipeline** — one click moves an enquiry New → Replied → Fulfilled
  (saved to the `status` column; falls back to this device's localStorage if
  the column/policy isn't in place yet)
- **Sample mode** — until the table is reachable it shows clearly-labelled
  example enquiries so the design can be reviewed

The password gate (`DASHBOARD_PASSWORD` in the file — change it before
handing over) is a soft curtain, same as Janet's dashboard. The real access
control is Supabase RLS. To wire it up, run the table SQL from
`api/print-enquiry.js` plus:

```sql
alter table print_enquiries add column status text default 'new';
alter table print_enquiries enable row level security;
-- public site inserts enquiries:
create policy "anon can insert" on print_enquiries for insert with check (true);
-- dashboard reads and updates status:
create policy "anon can read"   on print_enquiries for select using (true);
create policy "anon can update status" on print_enquiries for update using (true);
```

Honest note: with these policies anyone holding the publishable key can read
enquiries, so the password is presentation, not security — identical to the
Janet dashboard's model. If Phil wants real privacy later, deploy `admin/`
separately behind Vercel/Netlify password protection and swap the select/update
policies to a dedicated authenticated role.

## Imagery

`img/` holds the imagery stripped from the old philmcdarby.com — the 1200px
"large" versions where the old site had them (39 works), display size
otherwise. These are stand-ins: **when Phil's master files arrive, drop them
into `img/` under the same slug filenames and update `w`/`h` in
`js/works-data.js`** — nothing else changes. Never crop or letterbox the work;
the layout derives from each piece's own aspect ratio.

`js/works-data.js` is the single source of truth: slug, title, collection,
artist's note (his real copy), dimensions, featured flag, print size options.

## Local preview

Serve the **repo root** (paths are absolute `/phil-mcdarby/...`):

```
npx serve .   # then open /phil-mcdarby/
```
