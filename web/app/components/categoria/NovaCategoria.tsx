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
    <div className="page-container animate-fade-in">
      <div className="form-page">
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
            <div>
              <label htmlFor="nome" className="form-label">
                Nome da categoria
              </label>

              <input
                id="nome"
                type="text"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                placeholder="Ex: Alimentação"
                className="form-input"
              />
            </div>

            <div>
              <p className="form-label">Tipo de categoria</p>

              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTipoSelecionado("FIXA")}
                  className={`rounded-xl border p-4 text-left transition ${
                    tipoSelecionado === "FIXA"
                      ? "border-accent bg-accent-light text-accent ring-1 ring-accent/40"
                      : "border-border hover:bg-surface-hover"
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
                      : "border-border hover:bg-surface-hover"
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

            <div>
              <label htmlFor="limite" className="form-label">
                Limite mensal
              </label>

              <div className="form-input-group">
                <span className="text-sm font-bold text-muted">R$</span>

                <input
                  id="limite"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorOrcamento}
                  onChange={(e) => setValorOrcamento((e.target.value))}
                  placeholder="0,00"
                  className="form-input-control"
                />
              </div>

              <p className="mt-1.5 text-xs text-muted">
                Defina quanto pretende gastar nessa categoria por mês.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="form-label mb-1">Ícone</p>

                <p className="text-xs text-muted">
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
                          : "border-border bg-background text-foreground hover:bg-surface-hover"
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

            <div className="form-actions">
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
