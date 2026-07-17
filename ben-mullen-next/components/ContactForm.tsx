"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full border-b border-line bg-transparent py-3 text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none transition-colors";

/**
 * Enquiry form — posts to /api/contact (Resend). No mailto: deliberately;
 * mailto is unreliable on mobile. Progressive states, honest error messages.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-line pt-8">
        <p className="font-serif text-2xl font-light tracking-tight">
          Thank you — your enquiry is on its way.
        </p>
        <p className="mt-3 text-ink-soft">
          We&rsquo;ll be in touch shortly. For anything urgent, call{" "}
          <a href="tel:+353851269885" className="link-underline">
            +353 85 126 9885
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Simple honeypot — bots fill it, humans never see it. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="label">Name</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Project or enquiry</span>
        <textarea
          name="message"
          required
          rows={5}
          className={`${field} resize-none`}
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-ink" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="link-underline text-sm tracking-wide text-ink disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send enquiry →"}
      </button>
    </form>
  );
}
