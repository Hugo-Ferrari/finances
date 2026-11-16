import Link from "next/link";
import { ChevronRight, PiggyBank, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { rotuloTaxa } from "@/app/lib/financas";
import { ResumoCaixinha } from "@/app/types/caixinha";

export default function CardCaixinha({ caixinha }: { caixinha: ResumoCaixinha }) {
  return (
    <Link
      href={`/caixinhas/${caixinha.id}`}
      className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
            <PiggyBank size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-foreground">{caixinha.nome}</h2>
            <p className="truncate text-xs text-muted">
              {caixinha.instituicao ? `${caixinha.instituicao} · ` : ""}
              {rotuloTaxa(caixinha.taxaAtual)}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="mt-1 shrink-0 text-muted-light transition group-hover:text-accent" />
      </div>

      <p className="num mt-6 text-2xl font-extrabold tracking-tight text-foreground">
        {formatarMoeda(caixinha.saldo)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip bg-income-light text-income">
          <TrendingUp size={13} />
          <span className="num">+ {formatarMoeda(caixinha.rendimentoMes)} este mês</span>
        </span>
        <span className="num text-xs text-muted">rende {formatarMoeda(caixinha.rendimentoDia)}/dia</span>
      </div>
    </Link>
  );
}
