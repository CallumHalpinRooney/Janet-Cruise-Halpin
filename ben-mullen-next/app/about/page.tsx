import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { about, awards, studio, site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: about.lead,
};

export default function AboutPage() {
  return (
    <>
      {/* ── The practice ────────────────────────────────────────────── */}
      <section className="section-x mx-auto max-w-page py-16 sm:py-24">
        <p className="label">The practice</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:gap-16">
          <Reveal>
            <div className="relative aspect-[5/4] w-full overflow-hidden bg-paper-2">
              <Image
                src={about.portrait}
                alt={about.portraitAlt}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div>
              <p className="font-serif text-2xl font-light leading-[1.16] tracking-tight sm:text-3xl">
                {about.lead}
              </p>
              <div className="mt-8 max-w-prose space-y-5 text-ink-soft">
                {about.body.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
              <p className="mt-8 text-sm text-stone">{site.credentials}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Awards & recognition (accordion) ────────────────────────── */}
      <section className="section-x mx-auto max-w-page pb-16 sm:pb-24">
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-6">
          <h2 className="label">Awards &amp; Recognition</h2>
          <span className="text-xs text-stone">Select a line to read more</span>
        </div>
        <div className="mt-6">
          {awards.map((award) => (
            <details
              key={award.title}
              className="group border-b border-line py-6"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-xl font-light tracking-tight sm:text-2xl">
                  {award.title}
                </span>
                <span className="flex items-baseline gap-4 text-stone">
                  <span className="hidden text-sm sm:inline">
                    {award.subject}
                  </span>
                  <span className="text-sm tabular-nums">{award.year}</span>
                  <span className="text-lg leading-none transition-transform duration-300 ease-arch group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 max-w-prose text-ink-soft">{award.note}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── From the studio ─────────────────────────────────────────── */}
      <section className="section-x mx-auto max-w-page pb-24 sm:pb-32">
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-6">
          <h2 className="label">From the studio</h2>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-sm text-stone hover:text-ink"
          >
            {site.instagram.handle} →
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {studio.map((shot, i) => (
            <Reveal key={shot.src} as="figure" delay={(i % 4) * 60}>
              <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[0.72rem] uppercase tracking-label text-stone">
                {shot.label}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
