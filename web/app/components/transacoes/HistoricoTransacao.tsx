"use client";

import { LucideIcon } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";

type TipoHistorico = "ENTRADA" | "SAIDA" | "PERIODO";

interface HistoricoTransacaoProps {
  tipo: TipoHistorico;
  text: string;
  valor: number;
  icones: LucideIcon;
}

const estiloMap: Record<
  TipoHistorico,
  { card: string; label: string; valor: string; iconBg: string; iconColor: string }
> = {
  ENTRADA: {
    card: "bg-surface border border-border",
    label: "text-muted",
    valor: "text-income",
    iconBg: "bg-income-light",
    iconColor: "text-income",
  },
  SAIDA: {
    card: "bg-surface border border-border",
    label: "text-muted",
    valor: "text-expense",
    iconBg: "bg-expense-light",
    iconColor: "text-expense",
  },
  PERIODO: {
    card: "bg-primary border border-primary",
    label: "text-white/70",
    valor: "text-white",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
};

function HistoricoTransacao({ tipo, text, valor, icones: Icon }: HistoricoTransacaoProps) {
  const estilo = estiloMap[tipo];

  return (
    <div
      className={`flex items-center justify-between rounded-2xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${estilo.card}`}
    >
      <div>
        <p className={`text-sm font-medium ${estilo.label}`}>{text}</p>
        <p className={`mt-2.5 text-2xl font-extrabold tracking-tight ${estilo.valor}`}>
          {formatarMoeda(valor)}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${estilo.iconBg}`}
      >
        <Icon size={22} strokeWidth={2} className={estilo.iconColor} />
      </div>
    </div>
  );
}

export default HistoricoTransacao;
