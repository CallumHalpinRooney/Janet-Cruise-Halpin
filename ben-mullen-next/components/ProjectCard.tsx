import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
  /** Two-digit index shown as a quiet ordinal, e.g. "01". */
  index?: number;
  /** Aspect ratio for the frame — lets the grid breathe without cropping chaos. */
  aspect?: "portrait" | "landscape" | "square";
  priority?: boolean;
  sizes?: string;
};

const aspectClass = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  square: "aspect-square",
} as const;

export default function ProjectCard({
  project,
  index,
  aspect = "portrait",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: ProjectCardProps) {
  const cover = project.images[0];

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div
        className={`relative w-full overflow-hidden bg-paper-2 ${aspectClass[aspect]}`}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[1200ms] ease-arch group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3.5 border-t border-line pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="flex items-baseline gap-3 text-[0.98rem] font-medium tracking-tight">
            {index != null && (
              <span className="figure translate-y-px">
                {String(index).padStart(2, "0")}
              </span>
            )}
            <span>{project.title}</span>
          </h3>
          <span className="label whitespace-nowrap">{project.category}</span>
        </div>
        {project.award && (
          <p className="mt-1.5 pl-8 text-[0.78rem] text-stone">
            {project.award}
          </p>
        )}
      </div>
    </Link>
  );
}
