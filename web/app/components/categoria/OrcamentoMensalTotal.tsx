"use client";

import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { listarOrcamento } from "@/app/services/orcamento.service";
import { ListarDespesasCategoria } from "@/app/services/transacao.service";

type Orcamento = {
  valor: number | string;
};

function OrcamentoMensalTotal() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [utilizado, setUtilizado] = useState(0);

  useEffect(() => {
    Promise.all([listarOrcamento(), ListarDespesasCategoria()])
      .then(([orcamentosApi, despesasApi]) => {
        setOrcamentos(orcamentosApi);
        setUtilizado(
          despesasApi.reduce(
            (soma: number, item: { valor?: number | string | null }) =>
              soma + Number(item.valor ?? 0),
            0,
          ),
        );
      })
      .catch(() => {
        setOrcamentos([]);
        setUtilizado(0);
      });
  }, []);

  const total = orcamentos.reduce((soma, item) => soma + Number(item.valor), 0);
  const percentual = total > 0 ? Math.min((utilizado / total) * 100, 100) : 0;
  const restante = total - utilizado;

  const hoje = new Date();

  const diasRestantes =new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate() -hoje.getDate();
  
  const moeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-4 sm:flex-row">
      <div className="flex-1 rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2 text-muted text-sm">
          <Wallet size={16} />
          <span>Orçamento mensal total</span>
        </div>
        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {moeda(total)}
          </span>
          <span className="text-muted-light text-sm">limite</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-surface-dim">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-light">
          <span>0%</span>
          <span>{percentual.toFixed(0)}% utilizado</span>
          <span>100%</span>
        </div>
      </div>
      <div className="flex justify-between gap-4 rounded-xl border border-border bg-surface p-5 sm:w-65 sm:flex-col">
        <div>
          <p className="mb-1 text-muted-light">Restante</p>
          <p className={`font-semibold ${restante >= 0 ? "text-income" : "text-expense"}`}>
            {moeda(Math.abs(restante))}
          </p>
        </div>
        <div>
          <p className="mb-1 text-muted-light">Dias restantes</p>
          <p className="font-semibold text-foreground">{diasRestantes} dias</p>
        </div>
      </div>
    </div>
  );
}

export default OrcamentoMensalTotal;
