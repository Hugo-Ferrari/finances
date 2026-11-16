"use client";

import dynamic from "next/dynamic";
import { formatarMoeda } from "@/app/lib/formatters";
import { nomeDoMes } from "@/app/lib/financas";
import { MesComprometido } from "@/app/types/planejamento";

const BarChart = dynamic(
  () => import("@mui/x-charts/BarChart").then((m) => m.BarChart),
  { ssr: false, loading: () => <div className="skeleton h-[240px] w-full" /> },
);

const moedaCurta = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(valor);

/** Quanto das saídas fixas, parcelas (e da compra simulada) cai em cada mês. */
export default function GraficoComprometimento({
  dados,
  comNovaCompra = false,
}: {
  dados: MesComprometido[];
  comNovaCompra?: boolean;
}) {
  const series = [
    { data: dados.map((m) => m.fixas), label: "Contas fixas", color: "var(--chart-7)", stack: "total" },
    { data: dados.map((m) => m.parcelas), label: "Parcelas", color: "var(--chart-3)", stack: "total" },
    ...(comNovaCompra
      ? [{ data: dados.map((m) => m.novaCompra), label: "Esta compra", color: "var(--expense)", stack: "total" }]
      : []),
  ].map((s) => ({ ...s, valueFormatter: (v: number | null) => formatarMoeda(v ?? 0) }));

  return (
    <div className="w-full overflow-hidden">
      <BarChart
        height={240}
        borderRadius={4}
        grid={{ horizontal: true }}
        margin={{ left: 0, right: 8, top: 12, bottom: 0 }}
        xAxis={[
          {
            scaleType: "band",
            data: dados.map((m) => nomeDoMes(m.competencia, "short")),
            categoryGapRatio: 0.35,
            tickLabelStyle: { fontSize: 11, fill: "var(--muted)" },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        yAxis={[
          {
            width: 56,
            valueFormatter: (v: number) => moedaCurta(v),
            tickLabelStyle: { fontSize: 11, fill: "var(--muted-light)" },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        series={series}
        sx={{
          "& .MuiChartsGrid-line": { stroke: "var(--border)", strokeDasharray: "4 4" },
          "& .MuiChartsLegend-label": { fontSize: 12, fill: "var(--muted)" },
        }}
      />
    </div>
  );
}
