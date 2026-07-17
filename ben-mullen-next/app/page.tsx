import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { featuredProjects } from "@/data/projects";
import { site, home } from "@/data/site";

export default function HomePage() {
  return (
    <>
      {/* ── Hero: one strong image, one authoritative line ─────────────── */}
      <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-ink">
        <Image
          src={home.heroImage}
          alt={home.heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/55" />
        <div className="section-x absolute inset-x-0 bottom-0 mx-auto max-w-page pb-10 sm:pb-14">
          <h1 className="max-w-[19ch] font-serif text-3xl font-light leading-[1.06] tracking-tight text-paper sm:text-5xl lg:text-[3.4rem]">
            {site.positioning}
          </h1>
          <div className="mt-8 flex items-end justify-between gap-6 border-t border-line-inv pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {site.disciplines.map((d) => (
                <span
                  key={d}
                  className="font-mono text-[0.68rem] uppercase tracking-label text-paper/70"
                >
                  {d}
                </span>
              ))}
            </div>
            <span className="hidden whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-label text-paper/55 sm:block">
              Fig. 01 · Kilmantin Road
            </span>
          </div>
        </div>
      </section>

      {/* ── Positioning statement ──────────────────────────────────────── */}
      <section className="section-x mx-auto max-w-page py-20 sm:py-28 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:gap-16">
          <Reveal>
            <p className="font-serif text-2xl font-light leading-[1.14] tracking-tight sm:text-3xl">
              {home.statementLead}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="max-w-prose space-y-5 text-ink-soft">
              {home.statementBody.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured projects ──────────────────────────────────────────── */}
      <section className="section-x mx-auto max-w-page pb-24 sm:pb-32">
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-6">
          <h2 className="label">Selected Projects</h2>
          <Link
            href="/projects"
            className="link-underline text-sm text-stone hover:text-ink"
          >
            All work →
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 3) * 70} className="h-full">
              <ProjectCard
                project={project}
                index={i + 1}
                aspect={i === 0 ? "landscape" : "portrait"}
                priority={i === 0}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
