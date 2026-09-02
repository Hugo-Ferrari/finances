"use client";
import { LucideIcon } from "lucide-react";
import React from "react";
type Historico = {
  tipo: "ENTRADA" | "SAIDA" | "PERIODO";
  text: string;
  valor: number;
  icones: LucideIcon;
};
const estilos = {
  ENTRADA: {
    estilo: "bg-surface  ",
    texto: "text-black/60",
    valor: "text-black",
    icone: "bg-secondary",
  },
  SAIDA: {
    estilo: "bg-surface ",
    texto: "text-black/60",
    valor: "text-black",
    icone: "bg-muted-light/80",
  },
  PERIODO: {
    estilo: "bg-slate-900 ",
    texto: "text-white/80",
    valor: "text-white",
    icone: "bg-white/20 text-white",
  },
};
function HistoricoTransacao({ tipo, text, valor, icones: Icone }: Historico) {
  const estilo = estilos[tipo];
  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }
  return (
    <div className="">
      <div
        className={` flex h-35 items-center justify-between rounded-2xl p-5 transition-all duration-200 border-border border ${estilo.estilo} `}
      >
        <div>
          <p className={`text-sm font-medium ${estilo.texto}`}> {text} </p>
          <p className={` mt-2 text-2xl font-bold ${estilo.valor} `}>
            {formatarMoeda(valor)}
          </p>
        </div>
        <div
          className={` flex h-11 w-11 items-center justify-center rounded-full ${estilo.icone} `}
        >
          <Icone size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
export default HistoricoTransacao;
