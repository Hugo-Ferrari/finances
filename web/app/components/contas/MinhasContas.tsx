"use client";
import { listarConta } from "@/app/services/conta.service";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
type Conta = {
  id: number;
  nome: string;
  tipo: "CORRENTE" | "POUPANCA" | "CARTEIRA";
  saldo: string;
  ativa: boolean;
}; // adicionar incones antes do nome da conta
function MinhasContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  useEffect(() => {
    async function carregarConta() {
      const dados = await listarConta();
      setContas(dados);
    }
    carregarConta();
  }, []);
  function formatarSaldo(saldo: string) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(saldo));
  }
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold"> Minhas Contas </h1>
          <p className="text-sm text-muted mt-1">Visão geral das suas contas</p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white hover:bg-primary/20 hover:text-black transition"
          aria-label="Adicionar conta"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {contas.slice(0, 3).map((conta) => (
          <div
            key={conta.id}
            className="flex items-center justify-between border border-border rounded-xl p-4 hover:bg-surface-hover transition"
          >
            <div>
              <h2 className="font-semibold"> {conta.nome} </h2>
              <p className="text-sm text-muted mt-1"> {conta.tipo} </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-lg font-bold">{formatarSaldo(conta.saldo)}</p>
              <span
                className={
                  conta.ativa
                    ? "text-xs font-medium text-income"
                    : "text-xs font-medium text-expense"
                }
              >
                {conta.ativa ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {contas.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted"> Nenhuma conta cadastrada. </p>
        </div>
      )}
    </div>
  );
}
export default MinhasContas;
