# The Boat Yard Sauna — Website Strategy

How this website beats the current **Instagram + Linktree + booking app** setup
and is built to **boost sales**.

## Where the current setup leaks money

| Current setup | The problem |
|---|---|
| Instagram bio → Linktree → external booking app | 3 taps and 2 redirects before anyone can book. Every extra hop loses customers. |
| Linktree | Not indexed by Google. Nobody finds "sauna Wicklow" or "sauna Arklow" and lands on you. |
| Booking app | Lives behind someone else's brand and takes a cut. No upsells, no email list, no control. |
| Photos on Instagram | Great for discovery, terrible for converting a first-time visitor who wants details, prices and a slot *now*. |

## What this website does differently

### 1. One-tap booking, on your own page
The booking widget is built into the site — choose **location → session → date →
time → guests → extras → confirm**, all without leaving the page. Fewer steps =
more completed bookings.

### 2. It installs like an app (PWA) — beats their app advantage
The one thing the old setup did well was the app. This site is a **Progressive
Web App**: visitors get an **"Install / Add to Home Screen"** prompt and the
site opens full-screen, offline-capable, with your sailboat icon on their phone
— **no App Store, no download wait, no 15–30% store fees, and updates are
instant.** You match the app *and* skip everything that makes apps annoying.

### 3. Built to increase the value of every booking
- **Add-ons at checkout** — cold plunge, towel & robe hire, herbal tea, session
  photos. Each one lifts the average spend with zero extra marketing.
- **Private & group sessions** surfaced as the "most popular" option (anchored
  pricing nudges people up from the €15 drop-in).
- **Gift vouchers** — a major revenue line for saunas, especially at Christmas
  and birthdays. Hook is already in the footer, ready to wire to checkout.

### 4. Gets found on Google (free customers)
Proper page title, meta description, sitemap-ready, and **LocalBusiness
structured data** for both Wicklow Harbour and Arklow. Linktree can't do this —
this page can rank for "sauna Wicklow", "wood fired sauna Arklow", "cold dip
Wicklow", etc.

### 5. Captures the customer (so you can rebook them)
Every booking collects name, email and phone into your own list (via the
serverless function → Supabase/EmailJS). You own the relationship and can bring
people back — the old app keeps that data.

### 6. Reduces no-shows
Built to take a **small deposit on peak slots** via Stripe (the repo already has
the payment-intent function to plug in). Deposits dramatically cut no-shows,
which is pure recovered revenue.

## Suggested next steps to go fully live
1. **Swap in real photos** — drop them in `/assets` and update the `IMG` object
   at the top of the `<script>` in `index.html` (see `README.md`).
2. **Connect the booking backend** — set the env vars in Netlify so bookings
   land in a database and email you instantly (see `README.md`).
3. **Turn on deposits** — wire the existing Stripe `create-payment-intent`
   function into step 5 for peak slots.
4. **Real availability** — connect the slot grid to your actual calendar
   (Google Calendar / a bookings table) so times show true availability.
5. **Gift vouchers** — enable Stripe checkout on the voucher link.
6. **Point your domain** (e.g. `theboatyardsauna.ie`) at the Netlify site and
   put that single link in your Instagram bio in place of Linktree.
