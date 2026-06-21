import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crystal Point Surf Ranch — Where Perfect Waves Meet Luxury",
  description:
    "An exclusive private surf ranch with perfectly engineered waves, world-class coaching, and resort-level amenities.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${jost.variable} antialiased`}>
      <body className="flex flex-col bg-[#0C0A09] text-[#FAFAF9]">
        {children}
      </body>
    </html>
  );
}
