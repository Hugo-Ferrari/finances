"use client";

import { listarCategoria } from "@/app/services/categoria.service";
import { listarOrcamento } from "@/app/services/orcamento.service";
import React, { useEffect, useState } from "react";
import { Home, MoreVertical } from "lucide-react";
import CriarCategoria from "./CriarCategoria";

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

  const formatarMoeda = (valor: number | string) =>new Intl.NumberFormat("pt-BR", {
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

          return (
            <div
              key={itemCat.id}
              className="w-full  max-w-sm    rounded-2xl border     border-border  bg-surface   p-5  hover:shadow-md"
            >
             
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full ">
                    <Home size={20} className="text-foreground" />{/**o usuario que vai escolhe qual icone ele vai usar */}
                  </div>

                  <div>
                    <h1 className="font-semibold text-foreground">
                      {nomeCategoria}
                    </h1>

                    <p className="text-sm text-blue-500">Orçamento mensal</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-1 text-muted hover:bg-muted"
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

                  
                  <div className="mb-2 h-2 overflow-hidden rounded-full ">
                    <div className="h-full w-0 rounded-full bg-foreground transition-all" />
                  </div>

                  <p className="mb-4 text-right text-xs text-muted">
                    Nenhum gasto registrado
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
      <CriarCategoria/>
    </div>
  );
}

export default DetalhesCategorias;
