"use client";

import { ArrowDownLeft, ArrowUpRight, RefreshCw, Trash2, TrendingUp } from "lucide-react";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import { nomeDoMes } from "@/app/lib/financas";
import { Caixinha, MovimentoCaixinha } from "@/app/types/caixinha";

type Linha =
  | { tipo: "RENDIMENTO"; chave: string; data: string; valor: number; mes: string; parcial: boolean }
  | { tipo: MovimentoCaixinha["tipo"]; chave: string; data: string; valor: number; movimento: MovimentoCaixinha };

const ESTILO = {
  RENDIMENTO: { icone: TrendingUp, classe: "bg-accent-light text-accent" },
  DEPOSITO: { icone: ArrowUpRight, classe: "bg-income-light text-income" },
  RETIRADA: { icone: ArrowDownLeft, classe: "bg-expense-light text-expense" },
  AJUSTE: { icone: RefreshCw, classe: "bg-surface-dim text-muted" },
} as const;

interface ExtratoProps {
  caixinha: Caixinha;
  hoje: string;
  onRemover: (m: MovimentoCaixinha) => void;
}

/** Extrato igual ao do banco: depósitos, retiradas e um rendimento por mês. */
export default function ExtratoCaixinha({ caixinha, hoje, onRemover }: ExtratoProps) {
  // Só dá para desfazer o que veio depois da última atualização de saldo (ou ela mesma).
  const ultimoAjuste = [...caixinha.movimentos]
    .filter((m) => m.tipo === "AJUSTE")
    .sort((a, b) => (a.data === b.data ? b.id - a.id : a.data < b.data ? 1 : -1))[0];
  const podeDesfazer = (m: MovimentoCaixinha) =>
    caixinha.movimentos.length > 1 &&
    (!ultimoAjuste ||
      m.id === ultimoAjuste.id ||
      m.data > ultimoAjuste.data ||
      (m.data === ultimoAjuste.data && m.id > ultimoAjuste.id));

  const linhas: Linha[] = [
    ...caixinha.rendimentosMensais
      .filter((r) => Math.abs(r.valor) >= 0.01)
      .map((r) => ({
        tipo: "RENDIMENTO" as const,
        chave: `r-${r.mes}`,
        data: r.ate,
        valor: r.valor,
        mes: r.mes,
        parcial: r.ate === hoje,
      })),
    ...caixinha.movimentos.map((m) => ({ tipo: m.tipo, chave: `m-${m.id}`, data: m.data, valor: m.valor, movimento: m })),
  ].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? 1 : -1;
    // No mesmo dia: rendimento do mês no topo, depois o movimento mais recente.
    if (a.tipo === "RENDIMENTO") return -1;
    if (b.tipo === "RENDIMENTO") return 1;
    return b.movimento.id - a.movimento.id;
  });

  return (
    <section className="card p-6">
      <h2 className="text-base font-bold text-primary">Extrato</h2>
      <p className="mt-0.5 text-sm text-muted">Depósitos, retiradas e quanto rendeu em cada mês.</p>

      <ul className="mt-3 divide-y divide-border">
        {linhas.map((l) => {
          const { icone: Icone, classe } = ESTILO[l.tipo];
          const titulo =
            l.tipo === "RENDIMENTO"
              ? `Rendimento de ${nomeDoMes(l.mes).toLowerCase()}${l.parcial ? " (até hoje)" : ""}`
              : l.tipo === "DEPOSITO"
                ? "Depósito"
                : l.tipo === "RETIRADA"
                  ? "Retirada"
                  : "Saldo atualizado pelo banco";
          const detalhe =
            l.tipo === "RENDIMENTO"
              ? "Juros creditados"
              : l.movimento.conta
                ? `${l.tipo === "DEPOSITO" ? "Saiu de" : "Foi para"} ${l.movimento.conta.nome}`
                : l.tipo === "AJUSTE"
                  ? "Saldo informado"
                  : "Sem conta vinculada";
          const sinal = l.tipo === "RETIRADA" ? "− " : l.tipo === "AJUSTE" ? "= " : "+ ";
          return (
            <li key={l.chave} className="group flex items-center gap-3 py-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classe}`}>
                <Icone size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{titulo}</p>
                <p className="truncate text-xs text-muted">{detalhe}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`num text-sm font-bold ${l.tipo === "RENDIMENTO" || l.tipo === "DEPOSITO" ? "text-income" : "text-foreground"}`}>
                  {sinal}
                  {formatarMoeda(Math.abs(l.valor))}
                </p>
                <p className="text-xs text-muted-light">{formatarData(l.data)}</p>
              </div>
              {l.tipo !== "RENDIMENTO" && podeDesfazer(l.movimento) && (
                <button
                  type="button"
                  onClick={() => onRemover(l.movimento)}
                  aria-label={`Desfazer ${titulo.toLowerCase()} de ${formatarData(l.data)}`}
                  className="rounded-lg p-1.5 text-muted-light opacity-100 transition hover:bg-expense-light hover:text-expense sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
