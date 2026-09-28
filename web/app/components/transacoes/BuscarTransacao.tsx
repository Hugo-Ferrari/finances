"use client";

import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";
import React, { useEffect, useState } from "react";

type Categoria = {
  id: number;
  nome: string;
};

type Conta = {
  id: number;
  nome: string;
};

export type FiltrosTransacao = {
  busca: string;
  periodo: string;
  conta: number | null;
  categoria: number | null;
  ativo: boolean;
};

type Props = {
  filtros: FiltrosTransacao;
  onChange: (filtros: FiltrosTransacao) => void;
};

function BuscarTransacao({ filtros, onChange }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function carregarCategoria() {
      try {
        const dados = await listarCategoria();

        setCategorias(dados);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    async function carregarContas() {
      try {
        setContas(await listarConta());
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
      }
    }

    carregarCategoria();
    carregarContas();
  }, []);

  function atualizarFiltro(changes: Partial<FiltrosTransacao>) {
    onChange({ ...filtros, ...changes });
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-primary">Filtros</h2>
          <p className="mt-1 text-xs text-muted">
            Refine a visualização das movimentações
          </p>
        </div>
        <span className="hidden text-xs text-muted sm:block">Busca rápida</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,1fr))_auto_auto] xl:items-end">
        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Buscar
          </label>

          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => atualizarFiltro({ busca: e.target.value })}
            placeholder="Buscar transação..."
            className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Período
          </label>

          <select
            value={filtros.periodo}
            onChange={(e) => atualizarFiltro({ periodo: e.target.value })}
            className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Conta
          </label>

          <select
            value={filtros.conta ?? ""}
            onChange={(e) =>
              atualizarFiltro({
                conta: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Todas</option>
            {contas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Categoria
          </label>

          <select
            value={filtros.categoria ?? ""}
            onChange={(e) =>
              atualizarFiltro({
                categoria: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Todas</option>

            {categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex h-10 items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Ativo
          </label>

          <button
            type="button"
            onClick={() => atualizarFiltro({ ativo: !filtros.ativo })}
            className={`relative h-6 w-11 rounded-full transition ${
              filtros.ativo ? "bg-accent" : "bg-surface-dim"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                filtros.ativo ? "left-6" : "left-1"
              }`}
            />
          </button>

          <span className="text-sm">{filtros.ativo ? "Sim" : "Não"}</span>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              busca: "",
              periodo: "",
              conta: null,
              categoria: null,
              ativo: true,
            })
          }
          className="h-10 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-semibold text-muted transition hover:bg-surface-dim hover:text-primary"
        >
          Limpar Tudo
        </button>
      </div>
    </div>
  );
}

export default BuscarTransacao;
