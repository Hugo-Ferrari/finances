"use client";

import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";

import { criarTransacao } from "@/app/services/transacao.service";


import {  useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CreateTransacao {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  descricao?: string;
  data: Date;
  contaId: number;
  categoriaId?: number;
}

interface Categoria {
  id: number;
  nome: string;
}

interface Conta {
  id: number;
  nome: string;
}

function NovaTransacao() {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoTransacao, setTipoTransacao] = useState<"ENTRADA" | "SAIDA">(
    "ENTRADA",
  );
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [contaId, setContaId] = useState<number | null>(null);
  const [data, setData] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function carregarDados() {
      const categorias = await listarCategoria();
      const conta = await listarConta();

      setCategorias(categorias);
      setContas(conta);
    }

    carregarDados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("1 - Clicou em salvar");

  if (!valor || !contaId || !data) {
    console.log("2 - Validação falhou", {
      valor,
      contaId,
      data,
    });
    return;
  }

  const dados: CreateTransacao = {
    tipoTransacao,
    valor: Number(valor),
    descricao: descricao || undefined,
    data: new Date(data),
    contaId,
    categoriaId: categoriaId ?? undefined,
  };

  console.log("3 - Dados montados:", dados);
  console.log("4 - navigator.onLine:", navigator.onLine);

  try {
    const resultado = await criarTransacao(dados);

    console.log("5 - Resultado:", resultado);

    router.push("/dashboard");
  } catch (error) {
    console.error("6 - Erro:", error);
  }
};

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Nova transação
          </h1>

          <p className="mt-1 text-sm text-muted">
            Registre uma nova movimentação financeira.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-6 sm:p-8">
            <label
              htmlFor="valor"
              className="mb-3 block text-sm font-medium text-primary"
            >
              Valor da transação
            </label>

            <div className="flex items-center rounded-xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <span className="mr-3 text-sm font-medium text-muted">R$</span>

              <input
                name="valor"
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold text-primary outline-none placeholder:text-muted-light"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="border-b border-border p-6 sm:p-8">
              <label className="mb-3 block text-sm font-medium text-primary">
                Tipo da transação
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoTransacao("ENTRADA")}
                  className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                    tipoTransacao === "ENTRADA"
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border bg-background text-muted hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  Receita
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTransacao("SAIDA")}
                  className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                    tipoTransacao === "SAIDA"
                      ? "border-expense bg-expense text-white shadow-sm"
                      : "border-border bg-background text-muted hover:border-secondary/40 hover:text-primary"
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <label
                  htmlFor="descricao"
                  className="mb-2 block text-sm font-medium text-primary"
                >
                  Descrição
                </label>

                <input
                  id="descricao"
                  name="descricao"
                  type="text"
                  placeholder="Ex: Compra de mercado"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="categoria"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Categoria
                  </label>

                  <select
                    id="categoria"
                    name="categoria"
                    value={categoriaId ?? ""}
                    onChange={(e) =>
                      setCategoriaId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>

                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="conta"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Conta
                  </label>

                  <select
                    id="conta"
                    name="conta"
                    value={contaId ?? ""}
                    onChange={(e) =>
                      setContaId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="" disabled>
                      Selecione uma conta
                    </option>

                    {contas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome.toLocaleUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="mb-2 block text-sm font-medium text-primary"
                >
                  Data
                </label>

                <input
                  id="data"
                  name="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={()=> router.back()}
                  className="h-11 rounded-xl border border-border px-6 text-sm font-semibold text-muted transition hover:bg-surface-dim hover:text-primary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Salvar transação
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NovaTransacao;
