import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquiries and new commissions — ben mullen architects, Wicklow, Ireland.",
};

export default function ContactPage() {
  return (
    <section className="section-x mx-auto max-w-page py-16 sm:py-24">
      <header className="max-w-3xl border-b border-line pb-10">
        <h1 className="font-serif text-4xl font-light leading-none tracking-tight sm:text-6xl">
          Contact
        </h1>
        <p className="mt-6 max-w-prose text-lg text-ink-soft">
          For new commissions, collaborations and conservation enquiries. Tell
          us about the project and we&rsquo;ll be in touch.
        </p>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[0.6fr_0.4fr] lg:gap-20">
        <ContactForm />

        <aside className="space-y-10">
          <div>
            <p className="label mb-3">Office</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="link-underline block text-ink"
            >
              {site.contact.email}
            </a>
            <a
              href={site.contact.phoneHref}
              className="link-underline mt-1 block text-ink"
            >
              {site.contact.phone}
            </a>
            <address className="mt-4 not-italic leading-relaxed text-stone">
              {site.contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div>
            <p className="label mb-3">Instagram</p>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline block text-ink"
            >
              {site.instagram.handle}
            </a>
            <p className="mt-2 max-w-[36ch] text-sm text-stone">
              An active record of work in progress — and where much of our new
              work comes from.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
