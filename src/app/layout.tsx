import type { Metadata } from "next";
import { Playfair_Display, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"]
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "VII Congreso · Culturas Vivas Comunitarias · Colombia 2026",
  description: "Séptimo Congreso Latinoamericano y Caribeño - Todas las Voces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${barlowCondensed.variable} ${barlow.variable} antialiased bg-oscuro text-crema font-barlow overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
