"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { deletarCategoria, listarCategoria } from "@/app/services/categoria.service";
import { listarOrcamento } from "@/app/services/orcamento.service";
import { ListarDespesasCategoria } from "@/app/services/transacao.service";
import { formatarMoeda, intervaloMesAtual } from "@/app/lib/formatters";
import { diasRestantesNoMes, formatarNomeCategoria, Orcamento } from "@/app/lib/financas";
import { mensagemDeErro } from "@/app/lib/erros";
import { DespesaCategoria } from "@/app/types/categoria";
import CardOrcamento from "@/app/components/dashboard/CardOrcamento";
import SkeletonCard from "@/app/components/ui/Skeleton";
import CriarCategoria from "./CriarCategoria";
import IconeCategoria from "./IconeCategoria";

type Categoria = { id: number; nome: string };
type Dados = { categorias: Categoria[]; orcamentos: Orcamento[]; despesas: DespesaCategoria[] };

function situacao(uso: number | null) {
  if (uso === null) return { texto: "Sem limite", classe: "bg-surface-dim text-muted", cor: "var(--chart-7)" };
  if (uso >= 1) return { texto: "Estourou", classe: "bg-expense-light text-expense", cor: "var(--expense)" };
  if (uso >= 0.8) return { texto: "Atenção", classe: "bg-warning-light text-warning", cor: "var(--warning)" };
  return { texto: "No controle", classe: "bg-income-light text-income", cor: "var(--accent)" };
}

/** Resumo do orçamento do mês e um card por categoria. */
function DetalhesCategorias() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Categoria | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  useEffect(() => {
    Promise.all([listarCategoria(), listarOrcamento(), ListarDespesasCategoria(intervaloMesAtual())])
      .then(([categorias, orcamentos, despesas]) => setDados({ categorias, orcamentos, despesas }))
      .catch(() => setDados({ categorias: [], orcamentos: [], despesas: [] }));
  }, []);

  useEffect(() => {
    if (!paraExcluir) return;

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !excluindo) {
        setParaExcluir(null);
        setErroExclusao("");
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [paraExcluir, excluindo]);

  async function excluir() {
    if (!paraExcluir || !dados) return;
    setExcluindo(true);
    setErroExclusao("");
    try {
      await deletarCategoria(paraExcluir.id);
      setDados({ ...dados, categorias: dados.categorias.filter((c) => c.id !== paraExcluir.id) });
      setParaExcluir(null);
    } catch (error) {
      setErroExclusao(mensagemDeErro(error, "Não foi possível excluir a categoria."));
    } finally {
      setExcluindo(false);
    }
  }

  if (!dados) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard altura={240} />
        <SkeletonCard altura={240} />
        <SkeletonCard altura={240} />
      </div>
    );
  }

  const gastoDe = (id: number) =>
    dados.despesas.filter((d) => d.categoriaId === id).reduce((t, d) => t + Number(d.valor ?? 0), 0);
  const limiteDe = (id: number) => {
    const o = dados.orcamentos.find((x) => x.categoriaId === id);
    return o ? Number(o.valor) : null;
  };

  const limiteTotal = dados.orcamentos.reduce((t, o) => t + Number(o.valor), 0);
  const gastoOrcado = dados.orcamentos.reduce((t, o) => t + gastoDe(o.categoriaId), 0);

  const cards = dados.categorias
    .map((c) => {
      const gasto = gastoDe(c.id);
      const limite = limiteDe(c.id);
      return { ...c, gasto, limite, uso: limite ? gasto / limite : null };
    })
    .sort((a, b) => (b.uso ?? -1) - (a.uso ?? -1));

  const estouradas = cards.filter((c) => c.uso !== null && c.uso >= 1).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardOrcamento gasto={gastoOrcado} limite={limiteTotal} diasRestantes={diasRestantesNoMes()} />
        </div>
        <section className="card flex flex-col justify-center gap-3 p-6">
          <p className="text-sm text-muted">Categorias no mês</p>
          <p className="num text-3xl font-extrabold text-primary">{cards.length}</p>
          <p className={`text-sm font-semibold ${estouradas ? "text-expense" : "text-income"}`}>
            {estouradas
              ? `${estouradas} ${estouradas === 1 ? "passou" : "passaram"} do limite`
              : "Todas dentro do limite"}
          </p>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-base font-bold text-primary">Por categoria</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => {
            const s = situacao(c.uso);
            return (
              <article key={c.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `color-mix(in srgb, ${s.cor} 14%, transparent)`, color: s.cor }}
                    >
                      <IconeCategoria categoriaId={c.id} size={20} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-foreground">{formatarNomeCategoria(c.nome)}</h3>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${s.classe}`}>
                        {s.texto}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Excluir categoria ${formatarNomeCategoria(c.nome)}`}
                    onClick={() => {
                      setErroExclusao("");
                      setParaExcluir(c);
                    }}
                    className="rounded-lg p-1.5 text-muted-light transition hover:bg-expense-light hover:text-expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-2">
                  <p className="num text-2xl font-extrabold text-foreground">{formatarMoeda(c.gasto)}</p>
                  <p className="num text-sm text-muted">
                    {c.limite !== null ? `de ${formatarMoeda(c.limite)}` : "gastos no mês"}
                  </p>
                </div>

                {c.limite !== null && (
                  <>
                    <div className="progress mt-3">
                      <span style={{ width: `${Math.min(c.uso ?? 0, 1) * 100}%`, background: s.cor }} />
                    </div>
                    <p className="num mt-2 text-xs text-muted">
                      {c.limite - c.gasto >= 0
                        ? `Ainda pode gastar ${formatarMoeda(c.limite - c.gasto)}`
                        : `Passou ${formatarMoeda(c.gasto - c.limite)} do limite`}
                    </p>
                  </>
                )}
              </article>
            );
          })}
          <CriarCategoria />
        </div>
      </section>

      {paraExcluir && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !excluindo) {
              setParaExcluir(null);
              setErroExclusao("");
            }
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="excluir-categoria-titulo"
          >
            <h2 id="excluir-categoria-titulo" className="text-lg font-bold text-foreground">
              Excluir categoria
            </h2>
            <p className="mt-2 text-sm text-muted">
              Excluir <strong className="text-foreground">{formatarNomeCategoria(paraExcluir.nome)}</strong>? As
              transações continuam salvas, apenas ficam sem categoria. O limite desta categoria também será
              removido.
            </p>
            {erroExclusao && <p className="mt-3 text-sm font-medium text-expense">{erroExclusao}</p>}
            <div className="modal-actions mt-6">
              <button type="button" className="btn btn-ghost h-10" onClick={() => setParaExcluir(null)} disabled={excluindo}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger h-10" onClick={excluir} disabled={excluindo}>
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalhesCategorias;
