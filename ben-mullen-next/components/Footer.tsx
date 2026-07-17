import Link from "next/link";
import { site } from "@/data/site";

/** Black contact footer — the one inverted surface, closing every page. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper">
      <div className="section-x mx-auto max-w-page py-16 sm:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="max-w-[16ch] font-serif text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl">
              Let&rsquo;s build something.
            </p>
            <Link
              href="/contact"
              className="link-underline mt-8 inline-block text-sm tracking-wide text-paper"
            >
              Start an enquiry →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="label mb-3 text-stone-2">Office</p>
              <a
                href={`mailto:${site.contact.email}`}
                className="link-underline block text-paper/90"
              >
                {site.contact.email}
              </a>
              <a
                href={site.contact.phoneHref}
                className="link-underline mt-1 block text-paper/90"
              >
                {site.contact.phone}
              </a>
              <address className="mt-4 not-italic leading-relaxed text-stone-2">
                {site.contact.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div>
              <p className="label mb-3 text-stone-2">Elsewhere</p>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline block text-paper/90"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line-inv pt-6 text-xs tracking-wide text-stone-2">
          <span>
            © {year} {site.name} · {site.location}
          </span>
          <span>{site.credentials}</span>
        </div>
      </div>
    </footer>
  );
}
