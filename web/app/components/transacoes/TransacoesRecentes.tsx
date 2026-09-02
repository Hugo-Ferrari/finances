"use client";

import { listarTodasTransacoes } from "@/app/services/transacao.service";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Transacao = {
  id: number;
  descricao: string;
  valor: string;
  tipoTransacao: "ENTRADA" | "SAIDA";
  categoria: {
    nome: string;
  } | null;
};

function TransacoesRecentes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  useEffect(() => {
    async function listar() {
      try {
        const dados = await listarTodasTransacoes();

        setTransacoes(dados.slice(-5).reverse());
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    }

    listar();
  }, []);

  function formatarValor(valor: string) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor));
  }

  return (
    <div className="flex flex-col rounded-2xl bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">
            Transações recentes
          </h1>

          <p className="mt-1 text-sm text-muted">
            Últimas movimentações da sua conta
          </p>
        </div>

        <Link
          href={"/transacoes"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className=" grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-surface-dim pb-3  text-sm  text-muted">
        <p>Categoria</p>

        <p>Descrição</p>

        <p>Tipo</p>

        <p className="text-right">Valor</p>
      </div>

      <div>
        {transacoes.map((transacao) => {
          const entrada = transacao.tipoTransacao === "ENTRADA";

          return (
            <div
              key={transacao.id}
              className=" grid grid-cols-[2fr_1fr_1fr_1fr] items-center  gap-4  border-b  border-surface-dim  py-4 last:border-b-0 "
            >
              <p className="  truncate font-semibold text-primary ">
                {transacao.categoria?.nome.toLocaleUpperCase()}
              </p>

              <p className=" truncate  text-sm  text-muted">
                {transacao.descricao ??
                  "Sem categoria"}
              </p>

              <span
                className={` w-fit rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide
                  ${entrada ? "bg-income-light text-income" : "bg-expense-light text-expense"}`}
              >
                {entrada ? "Receita" : "Despesa"}
              </span>

              <p
                className={` text-right font-semibold
                  ${entrada ? "text-income" : "text-expense"}`}
              >
                {entrada ? "+ " : "- "}
                {formatarValor(transacao.valor)}
              </p>
            </div>
          );
        })}
      </div>

      {transacoes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-sm font-medium text-muted">
            Nenhuma transação encontrada.
          </p>

          <p className="mt-1 text-xs text-muted">
            Suas movimentações aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}

export default TransacoesRecentes;
