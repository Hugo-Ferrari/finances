"use client";

import { useEffect, useState } from "react";
import { obterResumoTotal } from "../services/transacao.service";
import { formatarMoeda } from "../lib/formatters";
import { Card } from "./ui/Card";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

type Resumo = { totalEntradas: string; totalSaidas: string };


interface MetricaProps {
  label: string;
  valor: number;
  tipo: "entrada" | "saida" | "saldo";
}

function MetricaItem({ label, valor, tipo }: MetricaProps) {
  const configMap = {
    entrada: {
      dot: "bg-income",
      text: "text-income",
      icon: TrendingUp,
      iconBg: "bg-income-light",
      iconColor: "text-income",
    },
    saida: {
      dot: "bg-expense",
      text: "text-expense",
      icon: TrendingDown,
      iconBg: "bg-expense-light",
      iconColor: "text-expense",
    },
    saldo: {
      dot: "bg-accent",
      text: "text-foreground",
      icon: Wallet,
      iconBg: "bg-accent-light",
      iconColor: "text-accent",
    },
  };

  const cfg = configMap[tipo];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-dim/50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.iconBg}`}>
          <Icon size={18} className={cfg.iconColor} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <p className={`text-base font-bold ${cfg.text}`}>{formatarMoeda(valor)}</p>
    </div>
  );
}


function SaldoTotal() {
  const [resumo, setResumo] = useState<Resumo>({ totalEntradas: "0", totalSaidas: "0" });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const dados = await obterResumoTotal();
        setResumo({ totalEntradas: dados.totalEntradas, totalSaidas: dados.totalSaidas });
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarResumo();
  }, []);

  const entradas = Number(resumo.totalEntradas);
  const saidas = Number(resumo.totalSaidas);
  const total = entradas - saidas;
  const positivo = total >= 0;

  if (carregando) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-9 w-48" />
          <hr className="divider my-4" />
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">
          Saldo das movimentações
        </p>
        <p
          className={`mt-2 text-4xl font-extrabold tracking-tight ${
            positivo ? "text-foreground" : "text-expense"
          }`}
        >
          {formatarMoeda(total)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {positivo ? "Resultado positivo no período" : "Resultado negativo no período"}
        </p>
      </div>

      <hr className="divider mb-5" />

      
      <div className="flex flex-col gap-3">
        <MetricaItem label="Entradas" valor={entradas} tipo="entrada" />
        <MetricaItem label="Saídas"   valor={saidas}   tipo="saida" />
      </div>
    </Card>
  );
}

export default SaldoTotal;
