"use client";

import { Transacao } from "@/app/types/transacao";


type Props = {
  transacao: Transacao;
};

function TransacaoItem({ transacao }: Props) {
  const valor = Number(transacao.valor);
 

  return (
    <div className="grid grid-cols-6 items-center border-b border-border p-4 text-sm transition last:border-b-0 hover:bg-background">
      <span className="font-semibold text-muted">{transacao.id}</span>

      <span>
        {new Intl.DateTimeFormat("pt-BR").format(new Date(transacao.data))}
      </span>

      <span className="truncate text-primary">
        {transacao.descricao || "Sem descrição"}
      </span>
      <span className="truncate text-muted">{transacao.conta.nome}</span>
      <span className="truncate text-muted">
        {transacao.categoria?.nome || "Sem categoria"}
      </span>
      <span
        className={
          transacao.tipoTransacao === "ENTRADA" ? "text-income" : "text-expense"
        }
      >
        {transacao.tipoTransacao === "ENTRADA" ? "+" : "-"}{" "}
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)}
      </span>
    </div>
  );
}

export default TransacaoItem;
