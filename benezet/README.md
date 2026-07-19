# Benezet Antiques — gallery site

A bespoke, premium **private-gallery catalogue** for Benezet Antiques, a fine
antiques dealer in Dublin. Not a shop: **there is no cart, no checkout, and no
pricing.** Every piece is **POA (price on application)** and fulfilment is
**enquiry → click & collect**.

The site lives under `/benezet/` and is deployed alongside the other Lonrú
sites in this repo (static HTML + Vercel serverless functions + Supabase +
Resend). Nothing here touches Janet's site or the other galleries.

```
benezet/
  index.html            Home — hero (page-load sequence) + curated collection + teasers
  collection/index.html The Collection — full grid + category filter
  piece/index.html      Piece detail — /benezet/piece/?slug=…  (catalogue entry)
  about/index.html      The Gallery — the trust story
  visit/index.html      Visit & Collect — address, hours, map, click & collect
  admin/index.html      Password-gated dashboard — create/edit pieces + upload photos
  css/site.css          The design system (charcoal + gilt tokens, type scale)
  js/wordmark.js        The cursive "Benezet" signature, as an inline SVG wordmark
  js/data.js            Typed-ish data layer: reads `pieces` from Supabase (seed fallback)
  js/site.js            Wordmark injection, nav, reveals, piece cards, the enquiry drawer
../api/benezet-enquiry.js  Serverless: logs to Supabase + emails Leo via Resend
```

## A note on the stack

The brief sketched a Next.js/Tailwind/Framer-Motion build. This repo — and every
sibling "Lonrú" site in it (Phil McDarby, Vintry, etc.) — is a **static HTML +
Vercel serverless + Supabase + Resend** codebase, and Vercel here publishes the
repo root statically. A Next.js app at the root would break the live deployments
and can't run without new provisioning. So Benezet is built the **house way**:
the same Supabase project, the same Resend enquiry pattern, the same soft-gated
dashboard. Every design and UX requirement in the brief is met — the tokens,
the cursive SVG wordmark, the restrained motion (respecting
`prefers-reduced-motion`), the catalogue/ledger treatment, the empty states,
the POA-only rule, the admin uploads. Motion is done with CSS transitions/
keyframes + IntersectionObserver rather than Framer Motion, and validation with
a hand-written schema that mirrors Zod rather than the library itself, because
there is no build step.

## Supabase setup

Uses the existing project (`lkwzyaygeqxfnmzekadj`). The public (anon) key is in
`js/data.js` and `admin/index.html` — safe to ship, as with the sibling sites.

### 1. Tables

```sql
-- The catalogue
create table if not exists pieces (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  maker text,
  period text,
  category text,               -- Furniture | Paintings | Mirrors | Silver | Lighting | Sculpture | Objets
  materials text,
  dimensions text,
  provenance text,
  condition_note text,
  stock_no text,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'available',  -- available | reserved | sold
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- The enquiry log (the "buy" replacement)
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  piece_id uuid references pieces(id) on delete set null,
  piece_title text,
  stock_no text,
  wants_collection boolean not null default false,
  created_at timestamptz not null default now()
);
```

### 2. Row-level security

The public site reads `pieces`; the enquiry function inserts `enquiries`; the
soft-gated `/admin` dashboard reads/writes `pieces` with the anon key.

```sql
alter table pieces enable row level security;
alter table enquiries enable row level security;

-- pieces: anyone may read; the dashboard (anon key) may write.
create policy "pieces read"   on pieces   for select using (true);
create policy "pieces insert" on pieces   for insert with check (true);
create policy "pieces update" on pieces   for update using (true) with check (true);
create policy "pieces delete" on pieces   for delete using (true);

-- enquiries: insert-only from the public (no read from the anon key).
create policy "enquiries insert" on enquiries for insert with check (true);
```

> The dashboard is a **soft gate** (a shared password in `admin/index.html`,
> like the other Lonrú dashboards), so the write policies above trust the anon
> key. That's fine for a one-person tool. To harden later, move writes behind a
> serverless function with a service-role key and drop the anon write policies.

### 3. Storage bucket for photographs

Leo uploads photos per-piece from `/admin` straight into Supabase Storage — no
redeploy, no console.

1. Create a **public** bucket named **`pieces`**.
2. Allow the anon key to upload / overwrite objects in it:

```sql
create policy "pieces bucket read"
  on storage.objects for select using ( bucket_id = 'pieces' );
create policy "pieces bucket write"
  on storage.objects for insert with check ( bucket_id = 'pieces' );
create policy "pieces bucket update"
  on storage.objects for update using ( bucket_id = 'pieces' );
```

Uploaded files are compressed client-side (max 1600px wide, JPEG q0.85) and the
resulting public URL is written into the piece's `images` array. Empty array →
the site shows the refined `PHOTOGRAPH TO FOLLOW` panel; one or more URLs → the
gallery.

### 4. Seed (optional)

`js/data.js` ships a **text-only** seed (no images) so the grid, filters and
detail page work before the table exists. Once the table is created and the
dashboard reachable, the seed is ignored. To seed the real table with the same
text-only rows, insert them from the SQL editor (copy titles/fields from the
`SEED` array) — but leave `images` as `[]`.

## Resend (enquiry email)

`api/benezet-enquiry.js` logs every enquiry to `enquiries` **and** emails Leo.
Set these in Vercel → Project → Settings → Environment Variables:

| Var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required for email to send |
| `BENEZET_EMAIL`  | Where enquiries land (Leo's inbox) |
| `RESEND_FROM`    | Verified sender, e.g. `Benezet Antiques <enquiries@benezet.ie>` (defaults to Resend's onboarding sender for testing) |

An enquiry counts as **delivered** if it was stored in Supabase **or** the email
went out; if both fail the endpoint returns `502` so the form shows an honest
retry. A hidden honeypot silently drops bots.

## The `/admin` dashboard

`/benezet/admin/` — password `leobenezet` (change it in `admin/index.html`
before handover). From here Leo can:

- create / edit / delete pieces (all catalogue fields + status + featured),
- drag-and-drop or pick photos to upload to the `pieces` bucket,
- reorder photos (first = cover) and delete them.

The dashboard is `noindex` and is **not** the retired root `/admin` (that one
is redirected away in `netlify.toml`; this one lives under `/benezet/`).

## The rule

No price, no cart, no checkout, anywhere. Verified across every route. If you
add a piece, it stays POA — that's the whole idea.
