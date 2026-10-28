"use client";

import { listarTodasTransacoes } from "@/app/services/transacao.service";
import { Transacao } from "@/app/types/transacao";
import { formatarMoeda, formatarData } from "@/app/lib/formatters";
import { Card, CardHeader } from "@/app/components/ui/Card";
import EmptyState from "@/app/components/ui/EmptyState";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


interface ItemProps {
  transacao: Transacao;
}

function TransacaoRow({ transacao }: ItemProps) {
  const isEntrada = transacao.tipoTransacao === "ENTRADA";
  const Icon = isEntrada ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className="flex items-center gap-4 border-b border-surface-dim py-3.5 last:border-b-0">
      
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isEntrada ? "bg-income-light" : "bg-expense-light"
        }`}
      >
        <Icon
          size={18}
          className={isEntrada ? "text-income" : "text-expense"}
          strokeWidth={2.5}
        />
      </div>

     
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {transacao.categoria?.nome
            ? transacao.categoria.nome.charAt(0).toUpperCase() +
              transacao.categoria.nome.slice(1).toLowerCase()
            : "Sem categoria"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {transacao.descricao ?? transacao.conta.nome}
        </p>
      </div>

     
      <div className="flex flex-col items-end shrink-0">
        <p
          className={`text-sm font-bold ${
            isEntrada ? "text-income" : "text-expense"
          }`}
        >
          {isEntrada ? "+" : "−"} {formatarMoeda(transacao.valor)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-light">
          {formatarData(transacao.data)}
        </p>
      </div>
    </div>
  );
}


function Skeleton() {
  return (
    <Card>
      <div className="mb-5 flex justify-between">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-9 w-9 rounded-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-surface-dim last:border-b-0">
          <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-4 w-20" />
        </div>
      ))}
    </Card>
  );
}


function TransacoesRecentes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function listar() {
      try {
        const dados = await listarTodasTransacoes();
        setTransacoes(dados.slice(-5).reverse());
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setCarregando(false);
      }
    }
    listar();
  }, []);

  if (carregando) return <Skeleton />;

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Transações Recentes"
        subtitle="Últimas movimentações da sua conta"
        action={
          <Link
            href="/transacoes"
            aria-label="Ver todas as transações"
            className="btn btn-icon btn-primary"
          >
            <ChevronRight size={18} />
          </Link>
        }
      />

      <div className="mt-5">
        {transacoes.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={22} />}
            title="Nenhuma transação encontrada"
            description="Suas movimentações aparecerão aqui após o primeiro lançamento."
          />
        ) : (
          transacoes.map((t) => <TransacaoRow key={t.id} transacao={t} />)
        )}
      </div>
    </Card>
  );
}

export default TransacoesRecentes;
