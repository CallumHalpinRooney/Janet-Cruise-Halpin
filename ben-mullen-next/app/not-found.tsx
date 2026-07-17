import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-x mx-auto flex min-h-[60svh] max-w-page flex-col justify-center py-24">
      <p className="label">404</p>
      <h1 className="mt-4 max-w-[18ch] font-serif text-4xl font-light leading-[1.05] tracking-tight sm:text-6xl">
        This page isn&rsquo;t here.
      </h1>
      <Link
        href="/"
        className="link-underline mt-8 inline-block w-fit text-sm tracking-wide text-stone hover:text-ink"
      >
        ← Return home
      </Link>
    </section>
  );
}
