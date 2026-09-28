"use client";

import {
  deletarCategoria,
  listarCategoria,
} from "@/app/services/categoria.service";
import { listarOrcamento } from "@/app/services/orcamento.service";
import React, { useEffect, useState } from "react";
import { Home, MoreVertical } from "lucide-react";
import CriarCategoria from "./CriarCategoria";
import { ListarDespesasCategoria } from "@/app/services/transacao.service";
import { DespesaCategoria } from "@/app/types/categoria";
import { useCategoriaIconeStore } from "@/app/store/categoriaIcone.store";
import { iconesCategoria } from "./iconesCategoria";
import { Are_You_Serious } from "next/font/google";

type Orcamento = {
  id: number;
  valor: number | string;
  categoriaId: number;
};

type Categoria = {
  id: number;
  nome: string;
};

function DetalhesCategorias() {
  const [orcamento, setOrcamento] = useState<Orcamento[]>([]);
  const [categorias, setCategoria] = useState<Categoria[]>([]);
  const [transacaoCategoria, setTransacaoCategoria] = useState<
    DespesaCategoria[]
  >([]);
  const iconesSalvos = useCategoriaIconeStore((state) => state.icones);

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] =
    useState<Categoria | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluirCategoria() {
    if (!categoriaParaExcluir) return;

    try {
      setExcluindo(true);

      await deletarCategoria(categoriaParaExcluir.id);

      setCategoria((categorias) =>
        categorias.filter(
          (categoria) => categoria.id !== categoriaParaExcluir.id,
        ),
      );

      setCategoriaParaExcluir(null);
      setModalAberto(false);
    } catch (error) {
      console.error(error);
    } finally {
      setExcluindo(false);
    }
  }

  const formatarMoeda = (valor: number | string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor));

  useEffect(() => {
    async function carregarOrcamento() {
      const dados = await listarOrcamento();
      setOrcamento(dados);
    }

    carregarOrcamento();
  }, []);

  useEffect(() => {
    async function carregarCategoria() {
      const dados = await listarCategoria();
      setCategoria(dados);
    }

    carregarCategoria();
  }, []);

  useEffect(() => {
    async function carregarDespesaCategoria() {
      const dados = await ListarDespesasCategoria();
      setTransacaoCategoria(dados);
    }
    carregarDespesaCategoria();
  }, []);

  return (
    <div className="flex flex-wrap gap-5">
      {categorias.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma categoria encontrada</p>
      ) : (
        categorias.map((itemCat) => {
          const orcamentoCategoria = orcamento.find(
            (item) => item.categoriaId === itemCat.id,
          );

          const nomeCategoria =
            itemCat.nome.charAt(0).toUpperCase() + itemCat.nome.slice(1);

          const gasto = transacaoCategoria
            .filter((item) => item.categoriaId === itemCat.id)
            .reduce((total, item) => total + Number(item.valor ?? 0), 0);

          const limite = Number(orcamentoCategoria?.valor ?? 0);

          const percentual =
            limite > 0 ? Math.min((gasto / limite) * 100, 100) : 0;
          const Icone =
            iconesCategoria.find(
              (icone) => icone.nome === iconesSalvos[itemCat.id],
            )?.componente ?? Home;
          return (
            <div
              key={itemCat.id}
              className="w-full  max-w-sm    rounded-2xl border     border-border  bg-surface   p-5  hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full ">
                    <Icone size={20} className="text-foreground" />
                  </div>

                  <div>
                    <h1 className="font-semibold text-foreground">
                      {nomeCategoria}
                    </h1>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-1 text-muted hover:bg-muted/50"
                  onClick={() => {
                    setCategoriaParaExcluir(itemCat);
                    setModalAberto(true);
                  }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              {orcamentoCategoria ? (
                <>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {formatarMoeda(orcamentoCategoria.valor)}
                    </span>

                    <span className="text-sm text-muted">limite</span>
                  </div>

                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-surface-dim">
                    <div
                      className={`h-full w-0 rounded-full transition-all ${percentual >= 100 ? "bg-expense" : "bg-income"}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>

                  <p className="mb-4 text-right text-xs text-muted">
                    {formatarMoeda(gasto)} gastos ({percentual.toFixed(0)}% do
                    limite)
                  </p>
                </>
              ) : (
                <div className="mb-4 rounded-xl  p-3">
                  <p className="text-sm text-muted">
                    Essa categoria ainda não possui um orçamento definido.
                  </p>
                </div>
              )}

              <hr className="mb-3 border-border" />
            </div>
          );
        })
      )}
      <CriarCategoria />
      {modalAberto && categoriaParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Excluir categoria
              </h2>

              <p className="mt-2 text-sm text-muted">
                Tem certeza que deseja excluir a categoria{" "}
                <strong>{categoriaParaExcluir.nome}</strong>?
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  setCategoriaParaExcluir(null);
                }}
                disabled={excluindo}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/10 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExcluirCategoria}
                disabled={excluindo}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
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
