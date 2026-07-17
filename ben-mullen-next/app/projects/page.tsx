import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected buildings, exhibitions and conservation work by ben mullen architects.",
};

export default function ProjectsPage() {
  return (
    <section className="section-x mx-auto max-w-page py-16 sm:py-24">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-8">
        <h1 className="font-serif text-4xl font-light leading-none tracking-tight sm:text-6xl">
          Work
        </h1>
        <p className="label pb-1">
          {projects.length} projects · 2021&ndash;2026
        </p>
      </header>

      <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 3) * 70}>
            <ProjectCard
              project={project}
              index={i + 1}
              aspect="portrait"
              priority={i < 3}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
