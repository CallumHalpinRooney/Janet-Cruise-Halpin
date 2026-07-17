import { NextResponse } from "next/server";

/**
 * Enquiry handler — delivers the contact form via Resend.
 *
 * STUBBED FOR THE CLIENT: set RESEND_API_KEY in .env.local (see .env.example)
 * and the route sends live. Without a key it fails cleanly with a clear
 * message rather than pretending to send, so nothing is silently lost.
 */

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let data: Payload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a filled "company" field means a bot. Pretend success, drop it.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please complete every field." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "office@benmullen.ie";
  const from = process.env.CONTACT_FROM_EMAIL || "enquiries@benmullen.ie";

  // No key configured yet — the client wires this. Fail honestly.
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — enquiry not sent.");
    return NextResponse.json(
      { error: "The enquiry form isn't live yet. Please email office@benmullen.ie directly." },
      { status: 503 },
    );
  }

  try {
    // Imported lazily so a missing key/package never breaks the build.
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: `ben mullen architects <${from}>`,
      to: [to],
      replyTo: email,
      subject: `Enquiry — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "We couldn't send that just now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please try again." },
      { status: 500 },
    );
  }
}
