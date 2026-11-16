import Link from "next/link";
import { ChevronRight, Landmark, PiggyBank, Wallet } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { rotuloTipoConta } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";
import EmptyState from "@/app/components/ui/EmptyState";

const ICONES = { CORRENTE: Landmark, POUPANCA: PiggyBank, CARTEIRA: Wallet } as const;

export default function ContasResumo({ contas }: { contas: Conta[] }) {
  const total = contas.reduce((t, c) => t + Number(c.saldo), 0);
  const ordenadas = [...contas].sort((a, b) => Number(b.saldo) - Number(a.saldo));

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Minhas contas</h2>
          <p className="mt-0.5 text-sm text-muted">Onde está o seu dinheiro</p>
        </div>
        <Link
          href="/contas"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim text-muted transition hover:bg-primary hover:text-white"
          aria-label="Ver contas"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {contas.length === 0 ? (
        <EmptyState icon={<Wallet size={24} />} title="Nenhuma conta cadastrada" />
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {ordenadas.map((conta) => {
            const Icone = ICONES[conta.tipo] ?? Wallet;
            const parte = total > 0 ? Math.max(Number(conta.saldo), 0) / total : 0;
            return (
              <li key={conta.id} className="rounded-2xl border border-border p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
                    <Icone size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{conta.nome}</p>
                    <p className="text-xs text-muted">{rotuloTipoConta(conta.tipo)}</p>
                  </div>
                  <p className="num shrink-0 text-sm font-bold text-foreground">
                    {formatarMoeda(conta.saldo)}
                  </p>
                </div>
                <div className="progress mt-3 h-1.5">
                  <span style={{ width: `${parte * 100}%`, background: "var(--accent)" }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
