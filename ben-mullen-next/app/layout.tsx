import type { Metadata } from "next";
import { Archivo, Spectral } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/data/site";

/**
 * Type system — deliberately not Inter.
 * Archivo: a confident, slightly grotesque sans that carries every label,
 * nav item and body line with authority.
 * Spectral: a restrained, sturdy serif reserved for the large statements —
 * an editorial voice architects recognise.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-grotesque",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
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
    <html lang="en" className={`${archivo.variable} ${spectral.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
