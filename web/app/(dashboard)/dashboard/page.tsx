"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import PageHeader from "@/app/components/ui/PageHeader";
import SkeletonCard from "@/app/components/ui/Skeleton";
import ExportarPlanilha from "@/app/components/transacoes/ExportarPlanilha";
import CardEconomia from "@/app/components/dashboard/CardEconomia";
import CardOrcamento from "@/app/components/dashboard/CardOrcamento";
import FluxoCaixa from "@/app/components/dashboard/FluxoCaixa";
import GastosCategoria from "@/app/components/dashboard/GastosCategoria";
import TransacoesRecentes from "@/app/components/dashboard/TransacoesRecentes";
import ContasResumo from "@/app/components/dashboard/ContasResumo";

import { useAuthStore } from "@/app/store/auth.store";
import { listarTodasTransacoes } from "@/app/services/transacao.service";
import { listarConta } from "@/app/services/conta.service";
import { listarOrcamento } from "@/app/services/orcamento.service";
import { listarCaixinhas } from "@/app/services/caixinha.service";
import { ResumoCaixinha } from "@/app/types/caixinha";
import {
  Orcamento,
  chaveMesAtual,
  diasRestantesNoMes,
  gastosPorCategoria,
  nomeDoMes,
  ordenarPorDataDesc,
  resumoDoMes,
  saldoTotal,
  serieMensal,
} from "@/app/lib/financas";
import { Transacao } from "@/app/types/transacao";
import { Conta } from "@/app/types/conta";

type Dados = {
  transacoes: Transacao[];
  contas: Conta[];
  orcamentos: Orcamento[];
  caixinhas: ResumoCaixinha[];
};

async function buscarDados(): Promise<Dados> {
  const [transacoes, contas, orcamentos, caixinhas] = await Promise.all([
    listarTodasTransacoes(),
    listarConta(),
    listarOrcamento(),
    // As caixinhas são um extra: se falharem, o dashboard abre sem elas.
    listarCaixinhas().catch(() => [] as ResumoCaixinha[]),
  ]);
  return { transacoes, contas, orcamentos, caixinhas };
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function Page() {
  const usuario = useAuthStore((state) => state.usuario);
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState(false);

  const aplicar = useCallback((busca: Promise<Dados>) => {
    busca.then(setDados).catch(() => setErro(true));
  }, []);

  useEffect(() => {
    aplicar(buscarDados());
  }, [aplicar]);

  function tentarNovamente() {
    setErro(false);
    aplicar(buscarDados());
  }

  const mes = chaveMesAtual();
  const calculos = useMemo(() => {
    if (!dados) return null;
    const gastos = gastosPorCategoria(dados.transacoes, mes, dados.orcamentos);
    const limite = dados.orcamentos.reduce((t, o) => t + Number(o.valor), 0);
    // Só conta no orçamento o que foi gasto em categorias com limite definido.
    const comLimite = new Set(dados.orcamentos.map((o) => o.categoriaId));
    const gastoOrcado = gastos
      .filter((g) => g.categoriaId !== null && comLimite.has(g.categoriaId))
      .reduce((t, g) => t + g.valor, 0);
    return {
      resumo: resumoDoMes(dados.transacoes, mes),
      serie: serieMensal(dados.transacoes, 6),
      gastos,
      limite,
      gastoOrcado,
      recentes: ordenarPorDataDesc(dados.transacoes).slice(0, 6),
      saldo: saldoTotal(dados.contas),
      caixinhas: {
        total: dados.caixinhas.reduce((t, c) => t + c.saldo, 0),
        rendimentoMes: dados.caixinhas.reduce((t, c) => t + c.rendimentoMes, 0),
      },
    };
  }, [dados, mes]);

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow={nomeDoMes(mes) + " de " + mes.slice(0, 4)}
        title={primeiroNome ? `${saudacao()}, ${primeiroNome}` : "Visão geral"}
        subtitle="Acompanhe quanto entra, quanto sai e quanto você está guardando."
        actions={
          <>
            <Link href="/ia" className="btn btn-ghost">
              <Sparkles size={16} /> Ler comprovante
            </Link>
            <ExportarPlanilha />
            <Link href="/novaTransacao" className="btn btn-primary">
              <Plus size={17} /> Nova transação
            </Link>
          </>
        }
      />

      {erro && (
        <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Não foi possível carregar seus dados.</p>
          <button type="button" className="btn btn-ghost h-10" onClick={tentarNovamente}>
            Tentar novamente
          </button>
        </div>
      )}

      {!calculos && !erro && (
        <div className="grid gap-5 lg:grid-cols-3">
          <SkeletonCard altura={260} className="lg:col-span-2" />
          <SkeletonCard altura={260} />
          <SkeletonCard altura={340} className="lg:col-span-2" />
          <SkeletonCard altura={340} />
        </div>
      )}

      {calculos && (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CardEconomia
              saldoContas={calculos.saldo}
              caixinhas={calculos.caixinhas}
              resumo={calculos.resumo}
              nomeMes={nomeDoMes(mes)}
            />
          </div>
          <CardOrcamento
            gasto={calculos.gastoOrcado}
            limite={calculos.limite}
            diasRestantes={diasRestantesNoMes()}
          />

          <div className="lg:col-span-2">
            <FluxoCaixa serie={calculos.serie} />
          </div>
          <GastosCategoria gastos={calculos.gastos} />

          <div className="lg:col-span-2">
            <TransacoesRecentes transacoes={calculos.recentes} />
          </div>
          <ContasResumo contas={dados!.contas} caixinhas={dados!.caixinhas} />
        </div>
      )}
    </div>
  );
}

export default Page;
