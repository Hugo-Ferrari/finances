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
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#11152f]">
          Descrição
        </label>

        <input
          type="text"
          value={props.descricao}
          onChange={(e) => props.setDescricao(e.target.value)}
          placeholder="Ex: Compra no supermercado"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#11152f] outline-none transition placeholder:text-gray-400 focus:border-[#8b7cf6] focus:ring-2 focus:ring-[#eeeaff]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#11152f]">
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
          className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#11152f] outline-none transition focus:border-[#8b7cf6] focus:ring-2 focus:ring-[#eeeaff]"
        >
          <option value="">
            Selecione uma categoria
          </option>

          {categorias.map((categoria) => (
            <option
              key={categoria.id}
              value={categoria.id}
            >
              {categoria.nome?.toLocaleUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#11152f]">
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
          className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#11152f] outline-none transition focus:border-[#8b7cf6] focus:ring-2 focus:ring-[#eeeaff]"
        >
          <option value="">
            Selecione uma conta
          </option>

          {contas.map((conta) => (
            <option
              key={conta.id}
              value={conta.id}
            >
              {conta.nome.toLocaleUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ConfigurarTransacao;