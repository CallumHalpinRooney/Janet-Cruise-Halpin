import type { Metadata } from "next";
import { Spectral, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/data/site";

/**
 * A deliberate three-register system — considered, not defaulted (no Inter).
 *
 * Spectral (Production Type): a restrained serif reserved for the large
 * statements — an editorial voice architects and designers recognise.
 * IBM Plex Sans + IBM Plex Mono (Bold Monday for IBM): a superfamily pairing.
 * The sans carries body and navigation; the mono is the technical hand —
 * labels, figures, drawing-style metadata — the way an architect annotates.
 */
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://benmullen.ie"),
  title: {
    default: "ben mullen architects — architecture & landscape, Ireland",
    template: "%s — ben mullen architects",
  },
  description: site.positioning,
  openGraph: {
    title: "ben mullen architects",
    description: site.positioning,
    type: "website",
    siteName: "ben mullen architects",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${spectral.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
