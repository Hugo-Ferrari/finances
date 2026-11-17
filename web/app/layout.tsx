import { Manrope, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthInitializer from "./components/AuthInitializer";
import { AUTOR } from "./lib/sobre";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "FinLogic",
  description: "Controle financeiro moderno e inteligente.",
  applicationName: "FinLogic",
  authors: [{ name: AUTOR }],
  creator: AUTOR,
  publisher: AUTOR,
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
