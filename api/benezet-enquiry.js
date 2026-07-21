/* Vercel serverless — benezet-enquiry.js
   Receives enquiries from the Benezet Antiques gallery (/benezet/).
   There is no shop and no checkout: every piece is POA and fulfilment
   is enquiry → click & collect. On each submission:

     1. Log the enquiry to Supabase (`enquiries`) so Leo has a real,
        dashboard-able record — not just an inbox.
     2. Email Leo via Resend with the piece, stock no. and the
        enquirer's details + message (Resend over mailto, always —
        the same pattern as the sibling Lonrú sites).

   A submission counts as delivered if it was stored OR Leo's email
   went out. On total failure we return 502 so the front end shows an
   honest retry instead of silently dropping a lead.

   Validation mirrors the client-side Zod-style schema and is the
   authoritative gate. Free-text is length-capped; a hidden honeypot
   ("company") silently swallows bots.

   Env vars (Vercel → Project → Settings → Environment Variables):
     RESEND_API_KEY   — required for email to be sent
     BENEZET_EMAIL    — where enquiries land (Leo's inbox)
     RESEND_FROM      — verified sender, e.g. "Benezet Antiques <enquiries@benezet.ie>"
                        (defaults to Resend's onboarding sender for testing)

   Supabase `enquiries` table (SQL in benezet/README.md):
     id, name, email, phone, message, piece_id (nullable uuid),
     piece_title, stock_no, wants_collection (bool), created_at
*/

const SUPABASE_URL = "https://lkwzyaygeqxfnmzekadj.supabase.co";
const SUPABASE_KEY = "sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  // ── honeypot: pretend success, do nothing ──
  if (clean(body.company, 200)) return res.status(200).json({ ok: true });

  // ── validate (authoritative) ──
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const message = clean(body.message, 4000);
  const pieceTitle = clean(body.piece_title, 200);
  const stockNo = clean(body.stock_no, 40);
  const wantsCollection = body.wants_collection === true || body.wants_collection === "true";
  const rawPieceId = clean(body.piece_id, 64);
  const pieceId = UUID_RE.test(rawPieceId) ? rawPieceId : null;

  const errors = {};
  if (name.length < 2) errors.name = "Name is required.";
  if (!EMAIL_RE.test(email)) errors.email = "A valid email is required.";
  if (message.length < 10) errors.message = "A short message is required.";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const problems = [];

  /* ── 1. log to Supabase ── */
  let stored = false;
  try {
    const row = {
      name, email, phone, message,
      piece_id: pieceId,
      piece_title: pieceTitle || null,
      stock_no: stockNo || null,
      wants_collection: wantsCollection,
    };
    const sb = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (sb.ok) stored = true;
    else problems.push(`Supabase ${sb.status}: ${await sb.text()}`);
  } catch (e) {
    problems.push(`Supabase exception: ${e.message}`);
  }

  /* ── 2. email Leo via Resend ── */
  let emailed = false;
  try {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.BENEZET_EMAIL;
    const from = process.env.RESEND_FROM || "Benezet Antiques <onboarding@resend.dev>";
    if (key && to) {
      const subjectPiece = pieceTitle ? `${pieceTitle}${stockNo ? ` (No. ${stockNo})` : ""}` : "General enquiry";
      const rows = [
        ["Piece", pieceTitle || "—"],
        ["Stock no.", stockNo ? `No. ${stockNo}` : "—"],
        ["Click & collect", wantsCollection ? "Yes — reserve requested" : "No"],
        ["From", name],
        ["Email", email],
        ["Phone", phone || "—"],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#8A857A;font:12px/1.4 monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${esc(
              k
            )}</td><td style="padding:6px 0;color:#1A1C1D;font:15px/1.5 Georgia,serif">${esc(v)}</td></tr>`
        )
        .join("");
      const html = `
        <div style="background:#EFEAE0;padding:28px">
          <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e2dccf">
            <div style="background:#2E3133;padding:20px 28px">
              <div style="color:#EFEAE0;font:italic 22px Georgia,serif">Benezet</div>
              <div style="color:#B08D57;font:11px monospace;letter-spacing:.24em;text-transform:uppercase;margin-top:4px">New enquiry</div>
            </div>
            <div style="padding:24px 28px">
              <h2 style="font:400 22px Georgia,serif;color:#1A1C1D;margin:0 0 16px">${esc(subjectPiece)}</h2>
              <table style="border-collapse:collapse;width:100%">${rows}</table>
              <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2dccf">
                <div style="color:#8A857A;font:12px monospace;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Message</div>
                <div style="font:15px/1.6 Georgia,serif;color:#1A1C1D;white-space:pre-wrap">${esc(message)}</div>
              </div>
            </div>
          </div>
        </div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `Enquiry — ${subjectPiece}`,
          html,
        }),
      });
      if (r.ok) emailed = true;
      else problems.push(`Resend ${r.status}: ${await r.text()}`);
    } else {
      problems.push("Resend not configured (RESEND_API_KEY / BENEZET_EMAIL missing)");
    }
  } catch (e) {
    problems.push(`Resend exception: ${e.message}`);
  }

  if (problems.length) console.error("benezet-enquiry:", problems.join(" | "));

  // Delivered if we stored the lead OR emailed Leo. The buyer's UX
  // should only report success when the enquiry actually landed.
  if (stored || emailed) return res.status(200).json({ ok: true, stored, emailed });
  return res.status(502).json({ error: "Enquiry could not be delivered", detail: problems });
};
