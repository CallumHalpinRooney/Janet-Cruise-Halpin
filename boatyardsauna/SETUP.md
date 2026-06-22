# Booking system — setup

The booking form works out of the box (it opens a pre-filled email so no booking
is ever lost). To switch on the full system, fill in the `CONFIG` object at the
top of the `<script>` in `index.html`. Each feature is independent — add what you
want, when you want. All keys below are **safe to expose in the browser** except
the Stripe **secret** key, which lives only in Netlify env vars.

```js
const CONFIG = {
  ownerEmail: 'hello@theboatyardsauna.ie',
  emailjs:  { publicKey:'', serviceId:'', templateOwner:'', templateCustomer:'' },
  supabase: { url:'', anonKey:'' },
  stripe:   { publishableKey:'' },
  deposit:  { enabled:false, amount:10, currency:'eur', label:'Refundable deposit' },
  schedule: { /* opening hours + capacity — already filled in, tweak to suit */ },
};
```

---

## 1) Email each booking (EmailJS) — ~10 min, free
Sends you (and optionally the customer) an email the instant someone books.

1. Create a free account at **emailjs.com**.
2. **Email Services** → add your email (e.g. Gmail) → note the **Service ID**.
3. **Email Templates** → New template for *you* (the owner). Use these variables in
   the body: `{{from_name}}`, `{{from_email}}`, `{{phone}}`, `{{booking_summary}}`,
   `{{notes}}`. Set "To email" to `{{to_email}}`. Note the **Template ID**.
4. (Optional) A second template to confirm the *customer* (same variables). Note its ID.
5. **Account → General** → copy your **Public Key**.
6. Fill `CONFIG.emailjs`:
   ```js
   emailjs: { publicKey:'XXXX', serviceId:'service_xxx', templateOwner:'template_owner', templateCustomer:'template_cust' }
   ```
   (Leave `templateCustomer` blank if you only want to notify yourself.)

## 2) Bookings dashboard + real availability (Supabase) — ~15 min, free
Stores every booking and powers the live slot availability and the dashboard.

1. Create a free project at **supabase.com**.
2. **SQL Editor** → run:
   ```sql
   create table bookings (
     id            bigint generated always as identity primary key,
     created_at    timestamptz default now(),
     location_id   text,  location text,
     session_id    text,  session text,
     booking_date  date,  booking_time text,
     guests        int,   addons text,
     total         numeric, deposit_paid numeric default 0, payment_id text,
     first_name text, last_name text, email text, phone text, notes text,
     status text default 'new'
   );
   alter table bookings enable row level security;
   -- allow the public site to create bookings and read availability:
   create policy "insert bookings"  on bookings for insert with check (true);
   create policy "read for availability" on bookings for select using (true);
   create policy "update status"    on bookings for update using (true);
   ```
   > Tip: for stricter privacy you can later split read/update behind an
   > authenticated role; the above is the simplest working setup.
3. **Project Settings → API** → copy the **Project URL** and the **anon public** key.
4. Fill `CONFIG.supabase` in `index.html` **and** the `SUPABASE` object at the top
   of `admin/index.html` with the same two values.
5. Availability now reflects real bookings automatically. Adjust opening hours and
   `capacityPerSlot` in `CONFIG.schedule`.

### The dashboard
Deploy `boatyardsauna/admin` as its **own** Netlify site (Base directory =
`boatyardsauna/admin`) for a private URL. It lists every booking, shows today's /
upcoming counts and booked value, and lets you Confirm or Cancel each one.

## 3) Card deposit (Stripe) — cut no-shows
1. Create an account at **stripe.com**, switch to **Test mode** first.
2. **Developers → API keys**: copy the **Publishable key** (`pk_...`) and the
   **Secret key** (`sk_...`).
3. In `index.html`: set `CONFIG.stripe.publishableKey = 'pk_...'` and
   `CONFIG.deposit.enabled = true` (set `amount` to your deposit in €).
4. In **Netlify → Site settings → Environment variables** add:
   `STRIPE_SECRET_KEY = sk_...` and (optional) `DEPOSIT_AMOUNT = 10`.
   The deposit amount is enforced server-side so it can't be tampered with.
5. Test with card `4242 4242 4242 4242`, any future date / CVC. Go live by
   swapping in your live keys when ready.

---

### How it all fits together
```
Customer books  ─▶  (optional) Stripe deposit  ─▶  saved to Supabase  ─▶  emails you + customer
                                                         │
                                          live availability + dashboard read from here
```
If a step isn't configured it's skipped; if everything is off, the form falls
back to a pre-filled email. Nothing is ever lost.
