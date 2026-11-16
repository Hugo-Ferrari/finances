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
import CardGastarHoje from "@/app/components/dashboard/CardGastarHoje";
import ProximosDias from "@/app/components/dashboard/ProximosDias";
import ContasAPagar from "@/app/components/dashboard/ContasAPagar";
import { obterGastarHoje } from "@/app/services/planejamento.service";
import { GastarHoje } from "@/app/types/planejamento";

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
  somarDiasISO,
} from "@/app/lib/financas";
import { Transacao } from "@/app/types/transacao";
import { Conta } from "@/app/types/conta";

/** Carregando = undefined; falhou = null (os extras somem sem travar o resto). */
type Talvez<T> = T | null | undefined;

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function Page() {
  const usuario = useAuthStore((state) => state.usuario);
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  // Cada fonte chega quando chegar: um card aparece assim que os dados DELE
  // estão prontos, sem esperar as outras requisições (antes era tudo ou nada).
  const [transacoes, setTransacoes] = useState<Transacao[] | undefined>();
  const [contas, setContas] = useState<Conta[] | undefined>();
  const [orcamentos, setOrcamentos] = useState<Orcamento[] | undefined>();
  const [caixinhas, setCaixinhas] = useState<ResumoCaixinha[] | undefined>();
  const [gastarHoje, setGastarHoje] = useState<Talvez<GastarHoje>>();
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    const falhou = () => setErro(true);
    listarTodasTransacoes().then(setTransacoes).catch(falhou);
    listarConta().then(setContas).catch(falhou);
    listarOrcamento().then(setOrcamentos).catch(falhou);
    // Extras: se falharem, o dashboard abre sem eles.
    listarCaixinhas()
      .then(setCaixinhas)
      .catch(() => setCaixinhas([]));
    obterGastarHoje()
      .then(setGastarHoje)
      .catch(() => setGastarHoje(null));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function tentarNovamente() {
    setErro(false);
    carregar();
  }

  const mes = chaveMesAtual();
  const doMes = useMemo(
    () =>
      transacoes && {
        resumo: resumoDoMes(transacoes, mes),
        serie: serieMensal(transacoes, 6),
        recentes: ordenarPorDataDesc(transacoes).slice(0, 6),
      },
    [transacoes, mes],
  );
  const orcamento = useMemo(() => {
    if (!transacoes || !orcamentos) return undefined;
    const gastos = gastosPorCategoria(transacoes, mes, orcamentos);
    const limite = orcamentos.reduce((t, o) => t + Number(o.valor), 0);
    // Só conta no orçamento o que foi gasto em categorias com limite definido.
    const comLimite = new Set(orcamentos.map((o) => o.categoriaId));
    const gastoOrcado = gastos
      .filter((g) => g.categoriaId !== null && comLimite.has(g.categoriaId))
      .reduce((t, g) => t + g.valor, 0);
    return { gastos, limite, gastoOrcado };
  }, [transacoes, orcamentos, mes]);
  const guardado = useMemo(
    () =>
      caixinhas && {
        total: caixinhas.reduce((t, c) => t + c.saldo, 0),
        rendimentoMes: caixinhas.reduce((t, c) => t + c.rendimentoMes, 0),
      },
    [caixinhas],
  );

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

      {/*
        No desktop são duas colunas independentes (cada uma empilha os próprios
        cards, sem depender da altura da outra). No celular os wrappers viram
        `contents`, então os cards voltam a ser filhos diretos do grid.
      */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Coluna esquerda (desktop) */}
        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          {doMes && contas && guardado ? (
            <CardEconomia
              saldoContas={saldoTotal(contas)}
              caixinhas={guardado}
              resumo={doMes.resumo}
              nomeMes={nomeDoMes(mes)}
              meta={gastarHoje ? gastarHoje.metaPercentual / 100 : undefined}
            />
          ) : (
            <SkeletonCard altura={260} />
          )}

          {gastarHoje !== null &&
            (gastarHoje ? (
              <ProximosDias dias={gastarHoje.proximosDias} />
            ) : (
              <SkeletonCard altura={180} />
            ))}

          {doMes ? <FluxoCaixa serie={doMes.serie} /> : <SkeletonCard altura={340} />}

          {doMes ? (
            <TransacoesRecentes transacoes={doMes.recentes} />
          ) : (
            <SkeletonCard altura={340} />
          )}
        </div>

        {/* Coluna direita (desktop) */}
        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          {gastarHoje !== null && (
            <>
              {/* No celular o "pode gastar hoje" vem primeiro. */}
              <div className="order-first lg:order-none">
                {gastarHoje ? (
                  <CardGastarHoje dados={gastarHoje} />
                ) : (
                  <SkeletonCard altura={420} />
                )}
              </div>

              {gastarHoje ? (
                <ContasAPagar
                  contas={gastarHoje.contas}
                  hoje={gastarHoje.hoje}
                  ate={
                    gastarHoje.proximoSalario
                      ? gastarHoje.fimCiclo
                      : somarDiasISO(gastarHoje.fimCiclo, -1)
                  }
                  onAtualizar={carregar}
                />
              ) : (
                <SkeletonCard altura={240} />
              )}
            </>
          )}

          {orcamento ? (
            <CardOrcamento
              gasto={orcamento.gastoOrcado}
              limite={orcamento.limite}
              diasRestantes={diasRestantesNoMes()}
            />
          ) : (
            <SkeletonCard altura={240} />
          )}

          {orcamento ? (
            <GastosCategoria gastos={orcamento.gastos} />
          ) : (
            <SkeletonCard altura={260} />
          )}

          {contas && caixinhas ? (
            <ContasResumo contas={contas} caixinhas={caixinhas} />
          ) : (
            <SkeletonCard altura={260} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;