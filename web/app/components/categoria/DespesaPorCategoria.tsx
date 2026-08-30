"use client";
import { ListarDespesasCategoria } from "@/app/services/transacao.service";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const PieChart = dynamic(
  () => import("@mui/x-charts/PieChart").then((mod) => mod.PieChart),
  { ssr: false },
);
type DespesaCategoria = {
  categoriaId: number | null;
  valor: string;
  categoria: { nome: string };
};
function DespesaPorCategoria() {
  const [transacaoCategoria, setTransacaoCategoria] = useState<
    DespesaCategoria[]
  >([]);
  useEffect(() => {
    async function carregarDespesaCategoria() {
      const dados = await ListarDespesasCategoria();
      setTransacaoCategoria(dados);
    }
    carregarDespesaCategoria();
  }, []);
  const data = transacaoCategoria
    .map((item) => ({
      id: item.categoriaId ?? 0,
      label: item.categoria?.nome.toLocaleUpperCase() ?? "Sem categoria",
      value: Number(item.valor),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };
  const formatarPercentual = (valor: number) => {
    if (total === 0) return "0%";
    return `${((valor / total) * 100).toFixed(1)}%`;
  };
  const cores = [
    "#F2B705",
    "#2563EB",
    "#10B981",
    "#F97316",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#EF4444",
  ];
  const dadosGrafico = data.map((item, index) => ({
    ...item,
    color: cores[index % cores.length],
  }));
  return (
    <div className="flex flex-col bg-surface rounded-2xl p-6 gap-6 border border-border">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Despesas por categoria
        </h1>
        <p className="text-sm text-muted mt-1">
          Distribuição das suas despesas
        </p>
      </div>

      {dadosGrafico.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted">Nenhuma despesa encontrada.</p>
        </div>
      ) : (
        <div className="flex items-center gap-8">
          <div className="relative flex items-center justify-center shrink-0">
            <PieChart
              series={[
                {
                  innerRadius: 52,
                  outerRadius: 72,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  data: dadosGrafico,
                },
              ]}
              margin={{ right: 5 }}
              width={180}
              height={180}
              hideLegend
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted"> Total </span>
              <span className="text-sm font-bold text-foreground">
                {formatarMoeda(total)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {dadosGrafico.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm truncate"> {item.label} </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted">
                    {formatarPercentual(item.value)}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatarMoeda(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default DespesaPorCategoria;
