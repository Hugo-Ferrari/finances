"use client";

import dynamic from "next/dynamic";
import { formatarMoeda } from "@/app/lib/formatters";
import { PontoMensal } from "@/app/lib/financas";

const BarChart = dynamic(
  () => import("@mui/x-charts/BarChart").then((m) => m.BarChart),
  { ssr: false, loading: () => <div className="skeleton h-[280px] w-full" /> },
);

const moedaCurta = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);

/** Entradas, saídas e o que sobrou em cada um dos últimos meses. */
export default function FluxoCaixa({ serie }: { serie: PontoMensal[] }) {
  const economiaTotal = serie.reduce((t, p) => t + p.economia, 0);
  const mesesPositivos = serie.filter((p) => p.economia > 0).length;

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Fluxo de caixa</h2>
          <p className="mt-0.5 text-sm text-muted">
            Entradas, saídas e economia nos últimos {serie.length} meses
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Economia acumulada</p>
          <p
            className={`num text-lg font-extrabold ${
              economiaTotal >= 0 ? "text-accent" : "text-expense"
            }`}
          >
            {formatarMoeda(economiaTotal)}
          </p>
          <p className="text-xs text-muted-light">
            {mesesPositivos} de {serie.length} meses no azul
          </p>
        </div>
      </div>

      <div className="-mx-2 mt-4">
        <BarChart
          height={280}
          borderRadius={6}
          grid={{ horizontal: true }}
          margin={{ left: 0, right: 8, top: 16, bottom: 0 }}
          xAxis={[
            {
              scaleType: "band",
              data: serie.map((p) => p.rotulo),
              categoryGapRatio: 0.35,
              barGapRatio: 0.15,
              tickLabelStyle: { fontSize: 12, fill: "var(--muted)" },
              disableLine: true,
              disableTicks: true,
            },
          ]}
          yAxis={[
            {
              width: 64,
              valueFormatter: (v: number) => moedaCurta(v),
              tickLabelStyle: { fontSize: 11, fill: "var(--muted-light)" },
              disableLine: true,
              disableTicks: true,
            },
          ]}
          series={[
            { data: serie.map((p) => p.entradas), label: "Entradas", color: "var(--income)", valueFormatter: (v) => formatarMoeda(v ?? 0) },
            { data: serie.map((p) => p.saidas), label: "Saídas", color: "var(--expense)", valueFormatter: (v) => formatarMoeda(v ?? 0) },
            { data: serie.map((p) => p.economia), label: "Economia", color: "var(--secondary)", valueFormatter: (v) => formatarMoeda(v ?? 0) },
          ]}
          sx={{
            "& .MuiChartsGrid-line": { stroke: "var(--border)", strokeDasharray: "4 4" },
            "& .MuiChartsLegend-label": { fontSize: 12, fill: "var(--muted)" },
          }}
        />
      </div>
    </section>
  );
}
