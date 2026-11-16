"use client";

import { criarCategoria, deletarCategoria } from "@/app/services/categoria.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { criarOrcamento } from "@/app/services/orcamento.service";
import { useCategoriaIconeStore } from "@/app/store/categoriaIcone.store";
import { iconesCategoria } from "./iconesCategoria";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

function NovaCategoria() {
  const router = useRouter();
  const definirIcone = useCategoriaIconeStore((state) => state.definirIcone);

  const [iconeSelecionado, setIconeSelecionado] = useState("Utensils");

  const [tipoSelecionado, setTipoSelecionado] = useState<"FIXA" | "VARIAVEL">(
    "FIXA",
  );

  const [nomeCategoria, setNomeCategoria] = useState("");

  const [valorOrcamento, setValorOrcamento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCategoria.trim()) {
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const categoria = await criarCategoria({
        nome: nomeCategoria.trim(),
      });

      try {
        await criarOrcamento({
          valor: Number(valorOrcamento),
          categoriaId: categoria.id,
        });
      } catch (error) {
        // Sem orçamento a categoria ficaria pela metade: desfaz a criação.
        await deletarCategoria(categoria.id).catch(() => undefined);
        throw error;
      }

      definirIcone(categoria.id, iconeSelecionado);

      setNomeCategoria("");
      setValorOrcamento('');
      setIconeSelecionado("Utensils");
      setTipoSelecionado("FIXA");

      router.push("/categorias");
    } catch (error) {
      setErro(
        mensagemDeErro(error, "Não foi possível criar a categoria. Tente novamente."),
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl animate-fade-in">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <p className="page-eyebrow">Planejamento</p>
          <h1 className="page-title">Nova categoria</h1>
          <p className="page-subtitle">
            Dê um nome, defina quanto pretende gastar por mês e escolha um ícone.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="nome"
                className="text-sm font-medium text-foreground"
              >
                Nome da categoria
              </label>

              <input
                id="nome"
                type="text"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                placeholder="Ex: Alimentação"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tipo de categoria
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoSelecionado("FIXA")}
                  className={`rounded-xl border p-4 text-left transition ${
                    tipoSelecionado === "FIXA"
                      ? "border-accent bg-accent-light text-accent ring-1 ring-accent/40"
                      : "border-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">Despesa Fixa</p>

                  <p
                    className={`mt-1 text-xs ${
                      tipoSelecionado === "FIXA"
                        ? "text-accent/80"
                        : "text-muted"
                    }`}
                  >
                    Gastos que se repetem mensalmente
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoSelecionado("VARIAVEL")}
                  className={`rounded-xl border p-4 text-left transition ${
                    tipoSelecionado === "VARIAVEL"
                      ? "border-accent bg-accent-light text-accent ring-1 ring-accent/40"
                      : "border-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">Despesa Variável</p>

                  <p
                    className={`mt-1 text-xs ${
                      tipoSelecionado === "VARIAVEL"
                        ? "text-accent/80"
                        : "text-muted"
                    }`}
                  >
                    Gastos que podem mudar mensalmente
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="limite"
                className="text-sm font-medium text-foreground"
              >
                Limite mensal
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                  R$
                </span>

                <input
                  id="limite"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorOrcamento}
                  onChange={(e) => setValorOrcamento((e.target.value))}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-foreground"
                />
              </div>

              <p className="text-xs text-muted">
                Defina quanto pretende gastar nessa categoria por mês.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Ícone</p>

                <p className="mt-1 text-xs text-muted">
                  Escolha um ícone para identificar sua categoria.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {iconesCategoria.map((item) => {
                  const Icone = item.componente;

                  const selecionado = iconeSelecionado === item.nome;

                  return (
                    <button
                      key={item.nome}
                      type="button"
                      title={item.nome}
                      onClick={() => setIconeSelecionado(item.nome)}
                      className={`flex h-12 items-center justify-center rounded-xl border transition ${
                        selecionado
                          ? "border-accent bg-accent-light text-accent ring-1 ring-accent/40"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icone size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            {erro && (
              <div
                role="alert"
                className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense animate-fade-in"
              >
                {erro}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
                className="btn btn-primary"
              >
                {salvando ? "Salvando..." : "Salvar Categoria"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NovaCategoria;
