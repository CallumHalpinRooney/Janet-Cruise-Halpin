import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lonrú Design — We Make Irish Business Shine",
  description:
    "A web design studio for Irish SMEs. Lonrú builds fast, beautiful, conversion-ready websites that put one Irish business at a time in the spotlight.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable} antialiased`}>
      <body className="flex flex-col bg-[#0A0A0A] text-[#FAFAF9]">
        {children}
      </body>
    </html>
  );
}
