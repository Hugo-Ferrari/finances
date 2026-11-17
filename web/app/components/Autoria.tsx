import Link from "next/link";
import { ANO_CRIACAO, AUTOR } from "@/app/lib/sobre";

/** Linha de autoria com os links legais (login, cadastro, configurações e páginas legais). */
export default function Autoria({ className = "" }: { className?: string }) {
  return (
    <footer className={`text-center text-xs leading-5 text-muted ${className}`}>
      <p>
        © {ANO_CRIACAO} FinLogic · Desenvolvido por{" "}
        <strong className="font-semibold text-foreground">{AUTOR}</strong>
      </p>
      <p className="mt-1 flex justify-center gap-3">
        <Link href="/termos" className="hover:text-primary hover:underline">
          Termos de Uso
        </Link>
        <Link href="/privacidade" className="hover:text-primary hover:underline">
          Política de Privacidade
        </Link>
      </p>
    </footer>
  );
}
