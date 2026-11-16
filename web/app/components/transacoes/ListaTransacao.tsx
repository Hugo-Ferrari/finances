"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Transacao } from "@/app/types/transacao";
import { formatarMoeda } from "@/app/lib/formatters";
import { ordenarPorDataDesc } from "@/app/lib/financas";
import { LinhaTransacao } from "@/app/components/dashboard/TransacoesRecentes";
import EmptyState from "@/app/components/ui/EmptyState";

const POR_PAGINA = 30;

function rotuloDia(dia: string) {
  const hoje = new Date();
  const data = new Date(`${dia}T00:00:00`);
  const diff = Math.round(
    (new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime() - data.getTime()) /
      86_400_000,
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  const texto = data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(data.getFullYear() !== hoje.getFullYear() && { year: "numeric" }),
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Lista agrupada por dia, com o resultado de cada dia. */
function ListaTransacao({ transacoes }: { transacoes: Transacao[] }) {
  const [limite, setLimite] = useState(POR_PAGINA);

  if (transacoes.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={24} />}
        title="Nenhuma transação encontrada"
        description="Ajuste os filtros ou registre uma nova transação."
      />
    );
  }

  const visiveis = ordenarPorDataDesc(transacoes).slice(0, limite);
  const grupos = new Map<string, Transacao[]>();
  for (const t of visiveis) {
    const dia = t.data.slice(0, 10);
    grupos.set(dia, [...(grupos.get(dia) ?? []), t]);
  }

  return (
    <div>
      {[...grupos.entries()].map(([dia, itens]) => {
        const saldoDia = itens.reduce(
          (t, i) => t + (i.tipoTransacao === "ENTRADA" ? 1 : -1) * Number(i.valor),
          0,
        );
        return (
          <section key={dia} className="border-b border-border last:border-b-0">
            <div className="flex items-center justify-between bg-surface-hover px-5 py-2.5 sm:px-6">
              <h3 className="text-xs font-bold text-muted">{rotuloDia(dia)}</h3>
              <span className={`num text-xs font-semibold ${saldoDia >= 0 ? "text-income" : "text-muted"}`}>
                {saldoDia >= 0 ? "+ " : "− "}
                {formatarMoeda(Math.abs(saldoDia))}
              </span>
            </div>
            <div className="divide-y divide-border px-5 sm:px-6">
              {itens.map((t) => (
                <LinhaTransacao key={t.id} transacao={t} />
              ))}
            </div>
          </section>
        );
      })}

      {transacoes.length > limite && (
        <div className="flex justify-center border-t border-border p-4">
          <button type="button" className="btn btn-ghost h-10" onClick={() => setLimite((l) => l + POR_PAGINA)}>
            Carregar mais ({transacoes.length - limite} restantes)
          </button>
        </div>
      )}
    </div>
  );
}

export default ListaTransacao;
