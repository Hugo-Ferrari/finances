"use client";

import { useEffect, useState } from "react";
import DespesaPorCategoria from "@/app/components/categoria/DespesaPorCategoria";
import SaldoTotal from "@/app/components/SaldoTotal";
import TransacoesRecentes from "@/app/components/transacoes/TransacoesRecentes";
import { buscarUsuario } from "@/app/services/auth.service";
import ResumoTransacoes from "@/app/components/transacoes/ResumoTransacoes";
import MinhasContas from "@/app/components/contas/MinhasContas";
import Link from "next/link";
import ExportarPlanilha from "@/app/components/transacoes/ExportarPlanilha";

type Usuario = { id: number; nome: string; email: string };

function Page() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const dados = await buscarUsuario();
      setUsuario(dados);
    }
    carregarUsuario();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-5 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Visão geral
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Bem vindo{usuario ? `, ${usuario.nome.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-2 text-sm text-muted">
            Gerencie seus pagamentos e transações em um clique
          </p>
        </div>
        <div>
          <Link
            href="/novaTransacao"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Nova Transação
          </Link>
          <ExportarPlanilha />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <SaldoTotal />
          <MinhasContas />
          <DespesaPorCategoria />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <ResumoTransacoes />
          <TransacoesRecentes />
        </div>
      </div>
    </div>
  );
}

export default Page;
