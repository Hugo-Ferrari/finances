import { formatarNomeCategoria } from "@/app/lib/financas";
import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";
import { DespesaCategoria } from "@/app/types/categoria";
import { Conta } from "@/app/types/conta";
import React, { useEffect, useState } from "react";

export type TipoTransacao = "ENTRADA" | "SAIDA";

/** Dados da transação lidos do comprovante, editáveis pelo usuário. */
export interface FormularioComprovante {
  tipoTransacao: TipoTransacao;
  /** Como o usuário digita: "95,52" */
  valor: string;
  /** YYYY-MM-DD */
  data: string;
  descricao: string;
  categoriaId?: number;
  contaId?: number;
}

interface ConfigurarTransacaoProps {
  formulario: FormularioComprovante;
  alterar<K extends keyof FormularioComprovante>(
    campo: K,
    valor: FormularioComprovante[K],
  ): void;
  /** Mostra o aviso de que a data não estava no comprovante. */
  dataEstimada?: boolean;
}

const TIPOS: { tipo: TipoTransacao; rotulo: string; ativo: string }[] = [
  { tipo: "SAIDA", rotulo: "Despesa", ativo: "border-expense bg-expense text-white" },
  { tipo: "ENTRADA", rotulo: "Receita", ativo: "border-income bg-income text-white" },
];

function ConfigurarTransacao({ formulario, alterar, dataEstimada }: ConfigurarTransacaoProps) {
  const [categorias, setCategorias] = useState<DespesaCategoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    listarCategoria()
      .then(setCategorias)
      .catch((error) => console.error("Erro ao buscar categorias:", error));
    listarConta()
      .then(setContas)
      .catch((error) => console.error("Erro ao buscar contas:", error));
  }, []);

  const numero = (texto: string) => {
    const valor = Number(texto);
    return valor > 0 ? valor : undefined;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className="form-label">Tipo</span>
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map(({ tipo, rotulo, ativo }) => (
            <button
              key={tipo}
              type="button"
              aria-pressed={formulario.tipoTransacao === tipo}
              onClick={() => alterar("tipoTransacao", tipo)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                formulario.tipoTransacao === tipo
                  ? ativo
                  : "border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="ia-valor" className="form-label">
          Valor
        </label>
        <div className="form-input-group">
          <span className="mr-2 text-sm font-bold text-muted">R$</span>
          <input
            id="ia-valor"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={formulario.valor}
            onChange={(e) => alterar("valor", e.target.value)}
            className="form-input-control num font-bold"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ia-data" className="form-label">
          Data
        </label>
        <input
          id="ia-data"
          type="date"
          value={formulario.data}
          onChange={(e) => alterar("data", e.target.value)}
          className="form-input"
        />
        {dataEstimada && (
          <p className="mt-1 text-xs text-warning">
            A data não estava no comprovante; usamos a de hoje.
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="ia-descricao" className="form-label">
          Descrição
        </label>
        <input
          id="ia-descricao"
          type="text"
          value={formulario.descricao}
          onChange={(e) => alterar("descricao", e.target.value)}
          placeholder="Ex: Compra no supermercado"
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="ia-categoria" className="form-label">
          Categoria
        </label>
        <select
          id="ia-categoria"
          value={formulario.categoriaId ?? ""}
          onChange={(e) => alterar("categoriaId", numero(e.target.value))}
          className="form-select"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {formatarNomeCategoria(categoria.nome ?? "")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ia-conta" className="form-label">
          Conta
        </label>
        <select
          id="ia-conta"
          value={formulario.contaId ?? ""}
          onChange={(e) => alterar("contaId", numero(e.target.value))}
          className="form-select"
        >
          <option value="">Selecione uma conta</option>
          {contas.map((conta) => (
            <option key={conta.id} value={conta.id}>
              {conta.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ConfigurarTransacao;
