import { ArrowDownRight, ArrowUpRight, PiggyBank } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { META_TAXA_ECONOMIA, ResumoMes } from "@/app/lib/financas";

interface CardEconomiaProps {
  saldoContas: number;
  resumo: ResumoMes;
  nomeMes: string;
}

function mensagemTaxa(taxa: number | null, economia: number) {
  if (taxa === null) return "Registre suas entradas do mês para acompanhar quanto você guarda.";
  if (economia < 0) return "Você gastou mais do que recebeu este mês. Reveja as maiores despesas.";
  if (taxa >= META_TAXA_ECONOMIA) return "Ótimo! Você está acima da meta de guardar 20% da renda.";
  return "Tente guardar pelo menos 20% do que entra. Você está quase lá.";
}

/** Destaque do dashboard: patrimônio e quanto sobrou no mês. */
export default function CardEconomia({ saldoContas, resumo, nomeMes }: CardEconomiaProps) {
  const taxa = resumo.taxa;
  const percentual = taxa === null ? 0 : Math.max(0, Math.min(taxa, 1));
  const atingiuMeta = taxa !== null && taxa >= META_TAXA_ECONOMIA;

  return (
    <section className="hero-card p-6 sm:p-8" aria-label="Resumo financeiro">
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Patrimônio em contas
          </p>
          <p className="num mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {formatarMoeda(saldoContas)}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10 sm:p-4">
              <p className="flex items-center gap-1 text-[11px] font-medium text-white/60 sm:text-xs">
                <ArrowUpRight size={14} className="text-secondary" /> Entrou
              </p>
              <p className="num mt-1 text-sm font-bold sm:text-lg">{formatarMoeda(resumo.entradas)}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10 sm:p-4">
              <p className="flex items-center gap-1 text-[11px] font-medium text-white/60 sm:text-xs">
                <ArrowDownRight size={14} className="text-[#ffb4b9]" /> Saiu
              </p>
              <p className="num mt-1 text-sm font-bold sm:text-lg">{formatarMoeda(resumo.saidas)}</p>
            </div>
            <div className="rounded-2xl bg-secondary/15 p-3 ring-1 ring-secondary/30 sm:p-4">
              <p className="flex items-center gap-1 text-[11px] font-medium text-secondary sm:text-xs">
                <PiggyBank size={14} /> Sobrou
              </p>
              <p className="num mt-1 text-sm font-bold sm:text-lg">{formatarMoeda(resumo.economia)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/50">Valores de {nomeMes.toLowerCase()}</p>
        </div>

        <div className="rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Taxa de economia
              </p>
              <p className="num mt-1 text-3xl font-extrabold">
                {taxa === null ? "—" : `${Math.round(taxa * 100)}%`}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                atingiuMeta ? "bg-secondary text-primary" : "bg-white/10 text-white/80"
              }`}
            >
              Meta 20%
            </span>
          </div>

          <div className="relative mt-4 h-2.5 rounded-full bg-white/10">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-secondary to-[#4fd1a5] transition-[width] duration-700"
              style={{ width: `${percentual * 100}%` }}
            />
            <span
              className="absolute -top-1 h-4.5 w-0.5 rounded bg-white/70"
              style={{ left: `${META_TAXA_ECONOMIA * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            {mensagemTaxa(taxa, resumo.economia)}
          </p>
        </div>
      </div>
    </section>
  );
}
