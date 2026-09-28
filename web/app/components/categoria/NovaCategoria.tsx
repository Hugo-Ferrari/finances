"use client";

import { criarCategoria } from "@/app/services/categoria.service";
import { criarOrcamento } from "@/app/services/orcamento.service";
import { useCategoriaIconeStore } from "@/app/store/categoriaIcone.store";
import { iconesCategoria } from "./iconesCategoria";
import { useRouter } from "next/navigation";

import { useState } from "react";

function NovaCategoria() {
  const router = useRouter();
  const definirIcone = useCategoriaIconeStore((state) => state.definirIcone);

  const [iconeSelecionado, setIconeSelecionado] = useState("Utensils");

  const [tipoSelecionado, setTipoSelecionado] = useState<"FIXA" | "VARIAVEL">(
    "FIXA",
  );

  const [nomeCategoria, setNomeCategoria] = useState("");

  const [valorOrcamento, setValorOrcamento] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCategoria.trim()) {
      return;
    }

    try {
      const categoria = await criarCategoria({
        nome: nomeCategoria.trim(),
      });

      await criarOrcamento({
        valor: valorOrcamento,
        categoriaId: categoria.id,
      });

      definirIcone(categoria.id, iconeSelecionado);

      setNomeCategoria("");
      setValorOrcamento(0);
      setIconeSelecionado("Utensils");
      setTipoSelecionado("FIXA");
      router.push("/categorias");
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
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
                      ? "border-foreground bg-foreground text-background"
                      : "border-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">Despesa Fixa</p>

                  <p
                    className={`mt-1 text-xs ${
                      tipoSelecionado === "FIXA"
                        ? "text-background/70"
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
                      ? "border-foreground bg-foreground text-background"
                      : "border-muted/60 hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">Despesa Variável</p>

                  <p
                    className={`mt-1 text-xs ${
                      tipoSelecionado === "VARIAVEL"
                        ? "text-background/70"
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
                  onChange={(e) => setValorOrcamento(Number(e.target.value))}
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
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icone size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl bg-primary/50 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-expense"
              >
                Cancelar
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-secondary hover:text-black"
              >
                Salvar Categoria
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NovaCategoria;
