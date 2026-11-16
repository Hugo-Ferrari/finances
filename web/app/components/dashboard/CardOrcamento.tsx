import Link from "next/link";
import { CalendarClock, Target } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";

interface CardOrcamentoProps {
  gasto: number;
  limite: number;
  diasRestantes: number;
}

/** Quanto do orçamento do mês já foi usado e quanto dá para gastar por dia. */
export default function CardOrcamento({ gasto, limite, diasRestantes }: CardOrcamentoProps) {
  if (limite <= 0) {
    return (
      <section className="card flex flex-col justify-between gap-4 p-6">
        <div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent">
            <Target size={20} />
          </span>
          <h2 className="mt-4 text-base font-bold text-primary">Orçamento do mês</h2>
          <p className="mt-1 text-sm text-muted">
            Defina limites por categoria para saber quanto ainda pode gastar.
          </p>
        </div>
        <Link href="/novaCategoria" className="btn btn-ghost h-10 self-start">
          Criar orçamento
        </Link>
      </section>
    );
  }

  const usado = gasto / limite;
  const restante = limite - gasto;
  const porDia = restante > 0 ? restante / Math.max(diasRestantes, 1) : 0;
  const cor = usado >= 1 ? "var(--expense)" : usado >= 0.8 ? "var(--warning)" : "var(--accent)";

  return (
    <section className="card flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Orçamento do mês</h2>
          <p className="mt-0.5 text-sm text-muted">Limite de {formatarMoeda(limite)}</p>
        </div>
        <span className="num rounded-full bg-surface-dim px-2.5 py-1 text-xs font-bold text-muted">
          {Math.round(usado * 100)}%
        </span>
      </div>

      <div>
        <div className="progress h-3">
          <span style={{ width: `${Math.min(usado, 1) * 100}%`, background: cor }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span className="num">Gasto {formatarMoeda(gasto)}</span>
          <span className="num">
            {restante >= 0 ? `Resta ${formatarMoeda(restante)}` : `Passou ${formatarMoeda(-restante)}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-hover p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
          <CalendarClock size={19} />
        </span>
        <p className="text-sm text-muted">
          {restante > 0 ? (
            <>
              Dá para gastar{" "}
              <strong className="num text-foreground">{formatarMoeda(porDia)}/dia</strong> nos
              próximos {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}.
            </>
          ) : (
            <strong className="text-expense">Orçamento do mês estourado.</strong>
          )}
        </p>
      </div>
    </section>
  );
}
