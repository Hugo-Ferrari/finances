import { formatarNomeCategoria } from "@/app/lib/financas";
import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";
import { DespesaCategoria } from "@/app/types/categoria";
import { Conta } from "@/app/types/conta";
import React, { useEffect, useState } from "react";

interface ConfigurarTransacaoProps {
  descricao: string;
  categoriaId?: number;
  contaId?: number;

  setDescricao(descricao: string): void;
  setCategoriaId(categoriaId: number | undefined): void;
  setContaId(contaId: number | undefined): void;
}

function ConfigurarTransacao(props: ConfigurarTransacaoProps) {
  const [categorias, setCategorias] = useState<DespesaCategoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function buscarCategoria() {
      try {
        const response = await listarCategoria();
        setCategorias(response);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    }

    buscarCategoria();
  }, []);

  useEffect(() => {
    async function buscarConta() {
      try {
        const response = await listarConta();
        setContas(response);
      } catch (error) {
        console.error("Erro ao buscar contas:", error);
      }
    }

    buscarConta();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="form-label">
          Descrição
        </label>

        <input
          type="text"
          value={props.descricao}
          onChange={(e) => props.setDescricao(e.target.value)}
          placeholder="Ex: Compra no supermercado"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">
          Categoria
        </label>

        <select
          value={props.categoriaId ?? ""}
          onChange={(e) => {
            const valor = Number(e.target.value);

            props.setCategoriaId(
              valor > 0 ? valor : undefined,
            );
          }}
          className="form-select"
        >
          <option value="">
            Selecione uma categoria
          </option>

          {categorias.map((categoria) => (
            <option
              key={categoria.id}
              value={categoria.id}
            >
              {formatarNomeCategoria(categoria.nome ?? "")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">
          Conta
        </label>

        <select
          value={props.contaId ?? ""}
          onChange={(e) => {
            const valor = Number(e.target.value);

            props.setContaId(
              valor > 0 ? valor : undefined,
            );
          }}
          className="form-select"
        >
          <option value="">
            Selecione uma conta
          </option>

          {contas.map((conta) => (
            <option
              key={conta.id}
              value={conta.id}
            >
              {conta.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ConfigurarTransacao;