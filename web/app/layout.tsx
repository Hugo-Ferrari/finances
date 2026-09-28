import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import AuthInitializer from "./components/AuthInitializer";

export const metadata = {
  title: "FinLogic",
  description: "Controle financeiro moderno e inteligente.",
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
