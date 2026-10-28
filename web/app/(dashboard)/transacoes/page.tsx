"use client";

import BuscarTransacao, {
  FiltrosTransacao,
} from "@/app/components/transacoes/BuscarTransacao";
import HistoricoTransacao from "@/app/components/transacoes/HistoricoTransacao";
import ListaTransacao from "@/app/components/transacoes/ListaTransacao";
import { obterResumoTotal } from "@/app/services/transacao.service";
import { ArrowUpRight, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FILTROS_INICIAIS: FiltrosTransacao = {
  busca: "",
  periodo: "",
  conta: null,
  categoria: null,
  ativo: true,
};

type Resumo = { totalEntradas: string; totalSaidas: string };

function Page() {
  const [resumo, setResumo] = useState<Resumo>({ totalEntradas: "0", totalSaidas: "0" });
  const [filtros, setFiltros] = useState<FiltrosTransacao>(FILTROS_INICIAIS);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const dados = await obterResumoTotal();
        setResumo(dados);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    }
    carregarResumo();
  }, []);

  const entradas = Number(resumo.totalEntradas);
  const saidas = Number(resumo.totalSaidas);
  const saldoPeriodo = entradas - saidas;

  return (
    <div className="page-container animate-fade-in">
      
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Movimentações</p>
          <h1 className="page-title">Histórico de transações</h1>
          <p className="page-subtitle">
            Acompanhe e gerencie todas as suas movimentações financeiras.
          </p>
        </div>

        <Link
          href="/novaTransacao"
          className="btn btn-primary"
        >
          Nova transação
          <ArrowUpRight size={16} />
        </Link>
      </header>

      
      <section aria-label="Resumo financeiro">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary">Resumo do período</h2>
          <span className="text-xs text-muted">Valores acumulados</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <HistoricoTransacao tipo="ENTRADA" text="Total de Entradas" valor={entradas}      icones={ChevronUp}   />
          <HistoricoTransacao tipo="SAIDA"   text="Total de Saídas"   valor={saidas}        icones={ChevronDown} />
          <HistoricoTransacao tipo="PERIODO" text="Saldo do Período"  valor={saldoPeriodo}  icones={Wallet}      />
        </div>
      </section>

     
      <section className="flex flex-col gap-4" aria-label="Lista de transações">
        <BuscarTransacao filtros={filtros} onChange={setFiltros} />

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 className="text-sm font-bold text-primary">Todas as transações</h2>
            <p className="mt-0.5 text-xs text-muted">
              Consulte os detalhes das suas movimentações
            </p>
          </div>
          <ListaTransacao filtros={filtros} />
        </div>
      </section>
    </div>
  );
}

export default Page;
