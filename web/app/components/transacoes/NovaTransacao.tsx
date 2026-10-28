"use client";

import { listarCategoria } from "@/app/services/categoria.service";
import { listarConta } from "@/app/services/conta.service";
import { criarTransacao } from "@/app/services/transacao.service";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CircleDollarSign } from "lucide-react";

interface CreateTransacao {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  descricao?: string;
  data: Date;
  contaId: number;
  categoriaId?: number;
}

interface Categoria { id: number; nome: string }
interface Conta    { id: number; nome: string }

type TipoTransacao = "ENTRADA" | "SAIDA";

const TIPO_CONFIG: Record<TipoTransacao, { label: string; active: string; idle: string }> = {
  ENTRADA: {
    label: "Receita",
    active: "border-income bg-income text-white shadow-sm",
    idle: "border-border bg-background text-muted hover:border-income/50 hover:text-income",
  },
  SAIDA: {
    label: "Despesa",
    active: "border-expense bg-expense text-white shadow-sm",
    idle: "border-border bg-background text-muted hover:border-expense/50 hover:text-expense",
  },
};

function NovaTransacao() {
  const router = useRouter();

  
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoTransacao, setTipoTransacao] = useState<TipoTransacao>("ENTRADA");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [contaId, setContaId] = useState<number | null>(null);
  const [data, setData] = useState("");

  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

 
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [cats, conts] = await Promise.all([listarCategoria(), listarConta()]);
        setCategorias(cats);
        setContas(conts);
      } catch {
        console.error("Erro ao carregar dados do formulário.");
      }
    }
    carregarDados();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!valor || !contaId || !data) {
      setErro("Preencha o valor, a conta e a data para continuar.");
      return;
    }

    const dados: CreateTransacao = {
      tipoTransacao,
      valor: Number(valor),
      descricao: descricao.trim() || undefined,
      data: new Date(data),
      contaId,
      categoriaId: categoriaId ?? undefined,
    };

    try {
      setCarregando(true);
      await criarTransacao(dados);
      router.push("/dashboard");
    } catch {
      setErro("Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background px-4 py-10 sm:px-6 lg:px-8">
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

          <p className="page-eyebrow">Finanças</p>
          <h1 className="page-title">Nova transação</h1>
          <p className="page-subtitle">
            Registre uma nova movimentação financeira.
          </p>
        </div>

        
        <div className="card overflow-hidden">

        
          <div className="border-b border-border bg-surface-dim/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <CircleDollarSign size={18} className="text-accent" />
              <label
                htmlFor="valor"
                className="text-sm font-bold text-primary"
              >
                Valor da transação
              </label>
            </div>

            <div
              className={`flex items-center rounded-xl border bg-background px-4 py-3 transition-all focus-within:ring-2 ${
                tipoTransacao === "ENTRADA"
                  ? "border-income/50 focus-within:ring-income/15"
                  : "border-expense/50 focus-within:ring-expense/15"
              }`}
            >
              <span className="mr-3 text-sm font-bold text-muted">R$</span>
              <input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-light/60"
              />
            </div>
          </div>

         
          <form onSubmit={handleSubmit}>
            
            <div className="border-b border-border p-6 sm:p-8">
              <p className="mb-3 text-sm font-bold text-primary">
                Tipo de transação
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["ENTRADA", "SAIDA"] as TipoTransacao[]).map((tipo) => {
                  const cfg = TIPO_CONFIG[tipo];
                  const isActive = tipoTransacao === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoTransacao(tipo)}
                      className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-150 ${
                        isActive ? cfg.active : cfg.idle
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

           
            <div className="space-y-5 p-6 sm:p-8">

              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="descricao" className="form-label">
                  Descrição
                </label>
                <input
                  id="descricao"
                  name="descricao"
                  type="text"
                  placeholder="Ex: Compra de mercado"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="form-input"
                />
              </div>

              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="categoria" className="form-label">
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={categoriaId ?? ""}
                    onChange={(e) =>
                      setCategoriaId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="form-select"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome.charAt(0).toUpperCase() + c.nome.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="conta" className="form-label">
                    Conta <span className="text-expense">*</span>
                  </label>
                  <select
                    id="conta"
                    name="conta"
                    value={contaId ?? ""}
                    onChange={(e) =>
                      setContaId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="form-select"
                  >
                    <option value="" disabled>
                      Selecione uma conta
                    </option>
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="data" className="form-label">
                  Data <span className="text-expense">*</span>
                </label>
                <input
                  id="data"
                  name="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="form-input"
                />
              </div>

              
              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense animate-fade-in"
                >
                  {erro}
                </div>
              )}

              
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={carregando}>
                  {carregando ? "Salvando..." : "Salvar transação"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NovaTransacao;
