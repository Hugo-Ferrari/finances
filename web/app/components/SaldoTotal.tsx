"use client";
import { useEffect, useState } from "react";
import { obterResumoTotal } from "../services/transacao.service";
type Resumo = { totalEntradas: string; totalSaidas: string };
function SaldoTotal() {
  const [resumo, setResumo] = useState<Resumo>({
    totalEntradas: "0",
    totalSaidas: "0",
  });
  useEffect(() => {
    async function carregarResumo() {
      try {
        const dados = await obterResumoTotal();
        setResumo({
          totalEntradas: dados.totalEntradas,
          totalSaidas: dados.totalSaidas,
        });
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    }
    carregarResumo();
  }, []);
  const entradas = Number(resumo.totalEntradas);
  const saidas = Number(resumo.totalSaidas);
  const total = entradas - saidas;
  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Saldo total</span>
        </div>
        <p className="text-3xl font-extrabold tracking-tight">
          {formatarMoeda(total)}
        </p>
        <p className="text-xs text-muted">Resultado das suas movimentações</p>
      </div>
      <div className="h-px bg-border my-6" />

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl  p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-income" />
            <span className="text-xs font-medium text-muted">Entradas</span>
          </div>
          <p className="text-lg font-bold text-income">
            {formatarMoeda(entradas)}
          </p>
        </div>

        <div className="rounded-xl  p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-expense" />
            <span className="text-xs font-medium text-muted">Saídas</span>
          </div>
          <p className="text-lg font-bold text-expense">
            {formatarMoeda(saidas)}
          </p>
        </div>
      </div>
    </div>
  );
}
export default SaldoTotal;
