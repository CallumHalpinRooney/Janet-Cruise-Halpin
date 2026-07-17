import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { projects, getProject } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.lead,
    openGraph: {
      title: `${project.title} — ben mullen architects`,
      description: project.lead,
      images: [project.images[0].src],
    },
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="section-x mx-auto max-w-page py-14 sm:py-20">
      <Link
        href="/projects"
        className="link-underline text-sm tracking-wide text-stone hover:text-ink"
      >
        ← Work
      </Link>

      {/* ── Header: title + facts panel ─────────────────────────────── */}
      <header className="mt-10 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-14">
        <div>
          <h1 className="font-serif text-[2.6rem] font-light leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            {project.title}
          </h1>
          <p className="label mt-4">{project.category}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          {project.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="text-[0.62rem] uppercase tracking-label text-stone">
                {fact.label}
              </dt>
              <dd
                className={`text-[0.92rem] ${
                  fact.label === "Award"
                    ? "font-medium text-ink"
                    : "text-ink-soft"
                }`}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ── Write-up: lead + body ───────────────────────────────────── */}
      <section className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
        <Reveal>
          <p className="max-w-[22ch] font-serif text-xl font-light leading-[1.2] tracking-tight sm:text-2xl">
            {project.lead}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="max-w-prose space-y-5 text-ink-soft">
            {project.body.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Gallery ─────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {project.video && (
          <Reveal as="figure" className="relative sm:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden bg-ink">
              <video
                src={project.video.src}
                poster={project.video.poster}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent p-4 text-[0.72rem] uppercase tracking-label text-paper">
              {project.video.label}
            </figcaption>
          </Reveal>
        )}

        {project.images.map((image, i) => (
          <Reveal
            key={image.src}
            as="figure"
            delay={(i % 2) * 60}
            className={image.wide ? "sm:col-span-2" : ""}
          >
            <div className="relative w-full overflow-hidden bg-paper-2">
              <Image
                src={image.src}
                alt={image.alt}
                width={1600}
                height={image.wide ? 900 : 1200}
                sizes={
                  image.wide
                    ? "(min-width: 1600px) 1600px, 100vw"
                    : "(min-width: 640px) 50vw, 100vw"
                }
                className="h-auto w-full"
              />
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Prev / next ─────────────────────────────────────────────── */}
      <nav className="mt-20 flex items-start justify-between gap-6 border-t border-line pt-8">
        <Link href={`/projects/${prev.slug}`} className="group flex flex-col gap-1.5">
          <span className="label text-stone">Previous</span>
          <span className="font-serif text-lg font-light tracking-tight sm:text-2xl">
            {prev.title}
          </span>
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          className="group ml-auto flex flex-col items-end gap-1.5 text-right"
        >
          <span className="label text-stone">Next</span>
          <span className="font-serif text-lg font-light tracking-tight sm:text-2xl">
            {next.title}
          </span>
        </Link>
      </nav>
    </article>
  );
}
