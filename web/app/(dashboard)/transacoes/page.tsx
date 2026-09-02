"use client";
import BuscarTransacao from "@/app/components/transacoes/BuscarTransacao";
import HistoricoTransacao from "@/app/components/transacoes/HistoricoTransacao";
import { obterResumoTotal } from "@/app/services/transacao.service";
import { ChevronDown, ChevronUp, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
type Resumo = { totalEntradas: string; totalSaidas: string };
function Page() {
  const [resumo, setResumo] = useState<Resumo>({
    totalEntradas: "0",
    totalSaidas: "0",
  });
  useEffect(() => {
    async function carregarResumo() {
      try {
        const dados = await obterResumoTotal();
        setResumo(dados);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    }
    carregarResumo();
  }, []);
  const entradas = Number(resumo.totalEntradas);
  const saidas = Number(resumo.totalSaidas);
  const saldoPeriodo = entradas - saidas;
  return (
    <div>
      <div className="grid grid-cols-3 gap-5 p-4">
        <HistoricoTransacao
          tipo="ENTRADA"
          text="Total de Entradas"
          valor={entradas}
          icones={ChevronUp}
        />

        <HistoricoTransacao
          tipo="SAIDA"
          text="Total de Saídas"
          valor={saidas}
          icones={ChevronDown}
        />

        <HistoricoTransacao
          tipo="PERIODO"
          text="Saldo do Período"
          valor={saldoPeriodo}
          icones={Wallet}
        />
      </div>
    </div>
  );
}
export default Page;
