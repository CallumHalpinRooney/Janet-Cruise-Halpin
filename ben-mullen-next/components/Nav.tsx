"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Persistent, minimal top bar. Brand → the three sections. Flat structure:
 * home → projects → a project is two clicks; nothing is deeper than three.
 */
export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md backdrop-saturate-150">
      <nav className="section-x mx-auto flex max-w-page items-center justify-between py-4">
        <Link
          href="/"
          className="text-[0.95rem] font-medium tracking-tight lowercase"
        >
          {site.name}
        </Link>
        <ul className="flex items-center gap-6 sm:gap-10">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-underline text-[0.82rem] tracking-wide ${
                    active ? "text-ink" : "text-stone hover:text-ink"
                  } transition-colors duration-300`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
