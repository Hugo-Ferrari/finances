"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Check } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { diaPorExtenso, rotuloDia } from "@/app/lib/financas";
import { ContaAPagar } from "@/app/types/planejamento";
import ModalPagar, { ItemPagar } from "@/app/components/planejamento/ModalPagar";

/** Contas fixas e parcelas que vencem até o próximo salário (ou fim do mês). */
export default function ContasAPagar({
  contas,
  hoje,
  ate,
  onAtualizar,
}: {
  contas: ContaAPagar[];
  hoje: string;
  ate: string;
  onAtualizar: () => void;
}) {
  const [pagando, setPagando] = useState<ItemPagar | null>(null);

  return (
    <section className="card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-primary">Contas a pagar</h2>
        <span className="num text-xs text-muted">até {diaPorExtenso(ate, { day: "2-digit", month: "2-digit" })}</span>
      </div>

      {contas.length === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <p className="flex items-center gap-2 text-sm text-muted">
            <CalendarCheck size={18} className="text-accent" /> Nenhuma conta fixa pendente no período.
          </p>
          <Link href="/planejamento" className="btn btn-ghost h-9 text-sm">Cadastrar contas fixas</Link>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {contas.map((c) => (
            <li key={`${c.recorrenteId}-${c.competencia}`} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                  <span className="truncate">{c.descricao}</span>
                  {c.parcela && (
                    <span className="num rounded-full bg-warning-light px-2 py-0.5 text-[11px] font-bold text-warning">
                      {c.parcela}/{c.parcelasTotal}
                    </span>
                  )}
                </p>
                <p className={`num text-xs ${c.atrasada ? "font-bold text-expense" : "text-muted"}`}>
                  {c.atrasada ? "Atrasada · " : ""}
                  {rotuloDia(c.data, hoje)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="num text-sm font-extrabold text-expense">{formatarMoeda(c.valor)}</span>
                <button
                  type="button"
                  aria-label={`Marcar ${c.descricao} como paga`}
                  title="Marcar como paga"
                  onClick={() => setPagando({ ...c })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:bg-accent-light hover:text-accent"
                >
                  <Check size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagando && (
        <ModalPagar
          item={pagando}
          onFechar={() => setPagando(null)}
          onPago={() => {
            setPagando(null);
            onAtualizar();
          }}
        />
      )}
    </section>
  );
}
