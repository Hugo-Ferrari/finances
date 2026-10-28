"use client";

import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";
import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";

type Categoria = { id: number; nome: string };
type Conta = { id: number; nome: string };

export type FiltrosTransacao = {
  busca: string;
  periodo: string;
  conta: number | null;
  categoria: number | null;
  ativo: boolean;
};

interface BuscarTransacaoProps {
  filtros: FiltrosTransacao;
  onChange: (filtros: FiltrosTransacao) => void;
}

function BuscarTransacao({ filtros, onChange }: BuscarTransacaoProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [cats, conts] = await Promise.all([listarCategoria(), listarConta()]);
        setCategorias(cats);
        setContas(conts);
      } catch (error) {
        console.error("Erro ao carregar filtros:", error);
      }
    }
    carregarDados();
  }, []);

  function atualizar(changes: Partial<FiltrosTransacao>) {
    onChange({ ...filtros, ...changes });
  }

  function limpar() {
    onChange({ busca: "", periodo: "", conta: null, categoria: null, ativo: true });
  }

  const temFiltroAtivo =
    filtros.busca || filtros.periodo || filtros.conta || filtros.categoria;

  return (
    <div className="card p-5 sm:p-6">
    
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-accent" />
          <h2 className="text-sm font-bold text-primary">Filtros</h2>
        </div>

        {temFiltroAtivo && (
          <button
            type="button"
            onClick={limpar}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface-dim hover:text-primary"
          >
            <X size={13} />
            Limpar
          </button>
        )}
      </div>

     
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.5fr)_repeat(3,minmax(130px,1fr))_auto]">
        
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Buscar</label>
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => atualizar({ busca: e.target.value })}
            placeholder="Descrição, conta ou categoria..."
            className="form-input"
          />
        </div>

       
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Período</label>
          <select
            value={filtros.periodo}
            onChange={(e) => atualizar({ periodo: e.target.value })}
            className="form-select"
          >
            <option value="">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
          </select>
        </div>

       
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Conta</label>
          <select
            value={filtros.conta ?? ""}
            onChange={(e) =>
              atualizar({ conta: e.target.value ? Number(e.target.value) : null })
            }
            className="form-select"
          >
            <option value="">Todas</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Categoria</label>
          <select
            value={filtros.categoria ?? ""}
            onChange={(e) =>
              atualizar({ categoria: e.target.value ? Number(e.target.value) : null })
            }
            className="form-select"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

       
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Ativo</label>
          <button
            type="button"
            role="switch"
            aria-checked={filtros.ativo}
            onClick={() => atualizar({ ativo: !filtros.ativo })}
            className={`relative h-[2.75rem] w-full rounded-xl border transition-colors ${
              filtros.ativo
                ? "border-accent bg-accent-light"
                : "border-border bg-background"
            }`}
          >
            <span className="text-xs font-semibold text-foreground">
              {filtros.ativo ? "Somente ativos" : "Todos"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuscarTransacao;
