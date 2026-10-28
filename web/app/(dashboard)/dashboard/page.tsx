"use client";

import { useEffect, useState } from "react";
import DespesaPorCategoria from "@/app/components/categoria/DespesaPorCategoria";
import SaldoTotal from "@/app/components/SaldoTotal";
import TransacoesRecentes from "@/app/components/transacoes/TransacoesRecentes";
import { buscarUsuario } from "@/app/services/auth.service";
import ResumoTransacoes from "@/app/components/transacoes/ResumoTransacoes";
import MinhasContas from "@/app/components/contas/MinhasContas";
import ExportarPlanilha from "@/app/components/transacoes/ExportarPlanilha";
import Link from "next/link";
import { Plus } from "lucide-react";

type Usuario = { id: number; nome: string; email: string };

function Page() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dados = await buscarUsuario();
        setUsuario(dados);
      } catch {
       
      }
    }
    carregarUsuario();
  }, []);

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <div className="page-container animate-fade-in">
      
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Visão geral</p>
          <h1 className="page-title">
            {primeiroNome ? `Olá, ${primeiroNome} 👋` : "Dashboard"}
          </h1>
          <p className="page-subtitle">
            Gerencie seus pagamentos e transações em um só lugar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportarPlanilha />
          <Link
            href="/novaTransacao"
            className="btn btn-primary"
          >
            <Plus size={17} />
            Nova Transação
          </Link>
        </div>
      </header>

      
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        
        <div className="flex flex-col gap-5 lg:col-span-1">
          <SaldoTotal />
          <MinhasContas />
          <DespesaPorCategoria />
        </div>

        
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ResumoTransacoes />
          <TransacoesRecentes />
        </div>
      </div>
    </div>
  );
}

export default Page;
