"use client";

import { useEffect, useState } from "react";
import DespesaPorCategoria from "@/app/components/categoria/DespesaPorCategoria";
import SaldoTotal from "@/app/components/SaldoTotal";
import TransacoesRecentes from "@/app/components/transacoes/TransacoesRecentes";
import { buscarUsuario } from "@/app/services/auth.service";
import ResumoTransacoes from "@/app/components/transacoes/ResumoTransacoes";
import MinhasContas from "@/app/components/contas/MinhasContas";
import Link from "next/link";

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
    <div className="flex flex-col gap-4 p-4">
      <header className="mt-5 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Bom dia{usuario ? `, ${usuario.nome.split(" ")[0]}` : ""}!
          </h1>
          <p className="flex text-muted-light text-sm">
            Gerencie seus pagamentos e transações em um clique
          </p>
        </div>
        <Link
          href="/novaTransacao"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Nova Transação
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
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
