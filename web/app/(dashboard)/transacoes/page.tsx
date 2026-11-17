"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Plus } from "lucide-react";

import PageHeader from "@/app/components/ui/PageHeader";
import BuscarTransacao, { FiltrosTransacao } from "@/app/components/transacoes/BuscarTransacao";
import ListaTransacao from "@/app/components/transacoes/ListaTransacao";
import ExportarPlanilha from "@/app/components/transacoes/ExportarPlanilha";
import { listarTodasTransacoes } from "@/app/services/transacao.service";
import { filtrarTransacoes } from "@/app/lib/filtrarTransacoes";
import { formatarMoeda } from "@/app/lib/formatters";
import { Transacao } from "@/app/types/transacao";

const FILTROS_INICIAIS: FiltrosTransacao = {
  busca: "",
  periodo: "mes",
  conta: null,
  categoria: null,
  ativo: true,
};

const ROTULO_PERIODO: Record<string, string> = {
  "": "Todo o período",
  hoje: "Hoje",
  semana: "Esta semana",
  mes: "Este mês",
  ano: "Este ano",
};

function Metrica({
  rotulo,
  valor,
  icone,
  destaque = false,
  cor,
}: {
  rotulo: string;
  valor: number;
  icone: React.ReactNode;
  destaque?: boolean;
  cor: string;
}) {
  return (
    <div className={destaque ? "hero-card p-5" : "card p-5"}>
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="caixa-valor flex-1">
          <p className={`text-xs font-medium ${destaque ? "text-white/70" : "text-muted"}`}>{rotulo}</p>
          <p className={`num valor-ajustavel mt-1 font-extrabold ${cor}`}>{formatarMoeda(valor)}</p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:hidden lg:flex ${
            destaque ? "bg-white/10 text-secondary" : "bg-surface-dim"
          } ${destaque ? "" : cor}`}
        >
          {icone}
        </span>
      </div>
    </div>
  );
}

function Page() {
  const [transacoes, setTransacoes] = useState<Transacao[] | null>(null);
  const [erro, setErro] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosTransacao>(FILTROS_INICIAIS);

  useEffect(() => {
    listarTodasTransacoes()
      .then(setTransacoes)
      .catch(() => setErro(true));
  }, []);

  const filtradas = useMemo(
    () => (transacoes ? filtrarTransacoes(transacoes, filtros) : []),
    [transacoes, filtros],
  );

  const entradas = filtradas.filter((t) => t.tipoTransacao === "ENTRADA").reduce((s, t) => s + Number(t.valor), 0);
  const saidas = filtradas.filter((t) => t.tipoTransacao === "SAIDA").reduce((s, t) => s + Number(t.valor), 0);
  const resultado = entradas - saidas;

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Movimentações"
        title="Transações"
        subtitle="Tudo o que entrou e saiu, com filtros para encontrar o que precisa."
        actions={
          <>
            <ExportarPlanilha />
            <Link href="/novaTransacao" className="btn btn-primary">
              <Plus size={17} /> Nova transação
            </Link>
          </>
        }
      />

      <section aria-label="Resumo do período">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary">Resumo</h2>
          <span className="chip">{ROTULO_PERIODO[filtros.periodo] ?? "Período filtrado"}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metrica rotulo="Entradas" valor={entradas} icone={<ArrowUpRight size={20} />} cor="text-income" />
          <Metrica rotulo="Saídas" valor={saidas} icone={<ArrowDownRight size={20} />} cor="text-expense" />
          <Metrica
            rotulo={resultado >= 0 ? "Você guardou" : "Gastou além do que entrou"}
            valor={resultado}
            icone={<PiggyBank size={20} />}
            destaque
            cor="text-white"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-label="Lista de transações">
        <BuscarTransacao filtros={filtros} onChange={setFiltros} />

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <h2 className="text-sm font-bold text-primary">Movimentações</h2>
            <span className="num text-xs text-muted">
              {filtradas.length} {filtradas.length === 1 ? "transação" : "transações"}
            </span>
          </div>
          {erro ? (
            <p className="p-6 text-sm text-expense">Não foi possível carregar as transações.</p>
          ) : transacoes === null ? (
            <div className="flex flex-col gap-3 p-6">
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : (
            <ListaTransacao
              key={JSON.stringify(filtros)}
              transacoes={filtradas}
              onExcluirTransacao={(id) =>
                setTransacoes((atuais) =>
                  atuais?.filter((transacao) => transacao.id !== id) ?? null,
                )
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default Page;
