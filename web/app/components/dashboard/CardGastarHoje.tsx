"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Info } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { diaPorExtenso, lerValor, simularGasto } from "@/app/lib/financas";
import { GastarHoje } from "@/app/types/planejamento";

/** Destaque do dashboard: quanto dá para gastar hoje sem comprometer as contas e a meta. */
export default function CardGastarHoje({ dados }: { dados: GastarHoje }) {
  const [simulacao, setSimulacao] = useState("");
  const [detalhes, setDetalhes] = useState(false);

  const valorSimulado = lerValor(simulacao);
  const simulado =
    Number.isFinite(valorSimulado) && valorSimulado > 0 ? simularGasto(dados, valorSimulado) : null;

  const usado = dados.porDia > 0 ? Math.min(dados.gastoHoje / dados.porDia, 1) : dados.gastoHoje > 0 ? 1 : 0;
  const ate = dados.proximoSalario
    ? `até o salário em ${diaPorExtenso(dados.proximoSalario.data)}`
    : "até o fim do mês";
  const cor =
    dados.estado === "NEGATIVO" ? "var(--expense)" : dados.estado === "ACIMA" ? "var(--warning)" : "var(--accent)";

  return (
    <section
      className="card relative flex flex-col gap-4 border-2 p-6"
      style={{ borderColor: cor, background: "linear-gradient(180deg, color-mix(in srgb, var(--accent-light) 55%, white) 0%, var(--surface) 55%)" }}
      aria-label="Quanto posso gastar hoje"
    >
      <div>
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: cor }}>
          <Clock3 size={15} /> Pode gastar hoje
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="num text-4xl font-extrabold tracking-tight text-primary">{formatarMoeda(dados.porDia)}</span>
          <span className="text-sm font-bold text-muted">/ dia</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          por <strong className="text-foreground">{dados.dias} {dados.dias === 1 ? "dia" : "dias"}</strong>, {ate}
        </p>
      </div>

      <div>
        <div className="flex justify-between text-sm font-bold">
          <span>Gasto hoje</span>
          <span className="num">
            {formatarMoeda(dados.gastoHoje)} de {formatarMoeda(dados.porDia)}
          </span>
        </div>
        <div className="progress mt-1.5 h-2.5">
          <span style={{ width: `${usado * 100}%`, background: cor }} />
        </div>
      </div>

      {dados.estado === "OK" && (
        <p className="flex items-center gap-2 rounded-xl bg-income-light px-3 py-2.5 text-sm font-semibold text-income">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>
            Você ainda pode gastar <strong className="num">{formatarMoeda(dados.restanteHoje)}</strong> hoje
          </span>
        </p>
      )}
      {dados.estado === "ACIMA" && (
        <p className="flex items-center gap-2 rounded-xl bg-warning-light px-3 py-2.5 text-sm font-semibold text-warning">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Você passou {formatarMoeda(-dados.restanteHoje)} do valor de hoje. Os próximos dias ficam com menos.
          </span>
        </p>
      )}
      {dados.estado === "NEGATIVO" && (
        <p className="flex items-center gap-2 rounded-xl bg-expense-light px-3 py-2.5 text-sm font-semibold text-expense">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            As contas e a meta passam do saldo em <strong className="num">{formatarMoeda(-dados.livre)}</strong>.
            Evite gastos extras até {dados.proximoSalario ? "o salário" : "o fim do mês"}.
          </span>
        </p>
      )}

      <button
        type="button"
        onClick={() => setDetalhes((d) => !d)}
        className="self-start text-xs font-bold text-accent hover:underline"
        aria-expanded={detalhes}
      >
        {detalhes ? "Esconder a conta" : "Como esse valor é calculado"}
      </button>
      {detalhes && (
        <div className="num flex flex-col gap-1.5 border-t border-dashed border-border pt-3 text-sm">
          <div className="flex justify-between gap-3"><span>Saldo nas contas</span><span>{formatarMoeda(dados.saldoDisponivel)}</span></div>
          <div className="flex justify-between gap-3"><span>Contas a pagar no período</span><span className="font-bold text-expense">− {formatarMoeda(dados.totalContas)}</span></div>
          <div className="flex justify-between gap-3">
            <span>Falta guardar ({dados.metaPercentual}% da renda)</span>
            <span className="font-bold text-expense">− {formatarMoeda(dados.metaRestante)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2 font-extrabold text-primary">
            <span>Livre {dados.proximoSalario ? "até o salário" : "até o fim do mês"}</span>
            <span style={{ color: dados.livre >= 0 ? "var(--accent)" : "var(--expense)" }}>{formatarMoeda(dados.livre)}</span>
          </div>
          <p className="mt-1 flex gap-1.5 text-xs text-muted">
            <Info size={13} className="mt-0.5 shrink-0" />
            Só conta corrente e carteira. Poupança e caixinhas ficam de fora: é dinheiro guardado.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-surface-dim p-3">
        <label htmlFor="simular-gasto" className="text-xs font-bold uppercase tracking-wide text-muted">
          E se eu gastar…
        </label>
        <div className="mt-1.5 flex items-center rounded-xl border border-border bg-surface pl-3 focus-within:border-[var(--border-focus)]">
          <span className="text-sm font-bold text-muted">R$</span>
          <input
            id="simular-gasto"
            inputMode="decimal"
            placeholder="0,00"
            className="h-10 w-full bg-transparent px-2 text-sm font-bold outline-none focus-visible:outline-none"
            value={simulacao}
            onChange={(e) => setSimulacao(e.target.value)}
          />
        </div>
        {simulado && (
          <p className="num mt-2 text-sm text-muted">
            {simulado.livreDepois < 0 ? (
              <span className="font-bold text-expense">Falta {formatarMoeda(-simulado.livreDepois)} para as contas e a meta.</span>
            ) : dados.dias > 1 ? (
              <>Os próximos dias caem para <strong className="text-warning">{formatarMoeda(simulado.porDiaDepois)} / dia</strong></>
            ) : (
              <>Sobram <strong className="text-warning">{formatarMoeda(simulado.livreDepois)}</strong> até amanhã</>
            )}
          </p>
        )}
      </div>

      {!dados.proximoSalario && (
        <Link href="/planejamento" className="text-xs font-semibold text-muted hover:text-accent">
          Cadastre seu salário e suas contas fixas para um valor mais preciso →
        </Link>
      )}
    </section>
  );
}
