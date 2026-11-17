"use client";

import { PeriodoTaxa } from "@/app/types/caixinha";

interface CampoTaxaProps {
  taxa: string;
  periodo: PeriodoTaxa;
  onTaxa: (valor: string) => void;
  onPeriodo: (periodo: PeriodoTaxa) => void;
  id?: string;
}

/** Taxa de rendimento + escolha entre "% ao mês" e "% ao ano". */
export default function CampoTaxa({ taxa, periodo, onTaxa, onPeriodo, id = "taxa" }: CampoTaxaProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="form-input-group sm:flex-1">
        <input
          id={id}
          inputMode="decimal"
          placeholder="Ex.: 1 ou 0,85"
          value={taxa}
          onChange={(e) => onTaxa(e.target.value)}
          className="form-input-control"
          required
        />
        <span className="text-sm font-bold text-muted">%</span>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-lg)] bg-surface-dim p-1" role="radiogroup" aria-label="Período da taxa">
        {(["MENSAL", "ANUAL"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={periodo === p}
            onClick={() => onPeriodo(p)}
            className={`h-9 whitespace-nowrap rounded-[var(--radius-md)] px-4 text-sm font-semibold transition ${
              periodo === p ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {p === "MENSAL" ? "ao mês" : "ao ano"}
          </button>
        ))}
      </div>
    </div>
  );
}
