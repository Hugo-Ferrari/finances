import { Landmark, PiggyBank, Wallet } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { Conta } from "@/app/types/conta";

/** Patrimônio total separado entre dinheiro disponível e reserva guardada. */
function CabecalhoMinhasContas({ contas }: { contas: Conta[] }) {
  const soma = (tipos: Conta["tipo"][]) =>
    contas.filter((c) => tipos.includes(c.tipo)).reduce((t, c) => t + Number(c.saldo), 0);
  const total = soma(["CORRENTE", "POUPANCA", "CARTEIRA"]);
  const guardado = soma(["POUPANCA"]);
  const disponivel = total - guardado;
  const parteGuardada = total > 0 ? Math.max(guardado, 0) / total : 0;

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <section className="hero-card p-6 lg:col-span-1">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Patrimônio total</p>
          <p className="num mt-2 text-3xl font-extrabold">{formatarMoeda(total)}</p>
          <p className="mt-1 text-sm text-white/60">
            {contas.length} {contas.length === 1 ? "conta" : "contas"}
          </p>
        </div>
      </section>

      <section className="card flex flex-col justify-between gap-4 p-6 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-dim text-primary">
              <Landmark size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted">Disponível para o dia a dia</p>
              <p className="num truncate text-lg font-extrabold text-foreground">{formatarMoeda(disponivel)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
              <PiggyBank size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted">Guardado na poupança</p>
              <p className="num truncate text-lg font-extrabold text-accent">{formatarMoeda(guardado)}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="progress h-2.5">
            <span style={{ width: `${parteGuardada * 100}%`, background: "var(--accent)" }} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Wallet size={13} />
            <span className="num">{Math.round(parteGuardada * 100)}%</span> do seu patrimônio está guardado como reserva.
          </p>
        </div>
      </section>
    </div>
  );
}

export default CabecalhoMinhasContas;
