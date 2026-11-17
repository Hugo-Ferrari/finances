import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft } from "lucide-react";
import Autoria from "@/app/components/Autoria";

/** Termos de Uso e Política de Privacidade: abertos para todos, logado ou não. */
export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary">
              <NextImage src="/icons/icon-192.png" alt="" width={36} height={36} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-primary">FinLogic</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary">
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>
      </header>

      <main className="legal mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

      <Autoria className="border-t border-border px-4 py-6" />
    </div>
  );
}
