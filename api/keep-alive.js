// Keeps the Supabase project awake. Free-tier Supabase pauses after ~7 days of
// inactivity; the daily Vercel cron (see "crons" in vercel.json) calls this and
// makes one tiny read so the project registers activity and never sleeps.
// Read-only and harmless.
const SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';

module.exports = async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return res.status(200).json({ ok: r.ok, supabase: r.status, at: new Date().toISOString() });
  } catch (e) {
    // Still 200 so the cron isn't flagged as failing; the ping itself is what matters.
    return res.status(200).json({ ok: false, error: e.message, at: new Date().toISOString() });
  }
};
