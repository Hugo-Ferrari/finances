"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { preverCaixinha } from "@/app/services/caixinha.service";
import { formatarMoeda } from "@/app/lib/formatters";
import { lerValor } from "@/app/lib/financas";
import { PontoPrevisao } from "@/app/types/caixinha";

const LineChart = dynamic(() => import("@mui/x-charts/LineChart").then((m) => m.LineChart), {
  ssr: false,
  loading: () => <div className="skeleton h-[280px] w-full" />,
});

const PRAZOS = [
  { meses: 6, rotulo: "6 meses" },
  { meses: 12, rotulo: "1 ano" },
  { meses: 24, rotulo: "2 anos" },
  { meses: 60, rotulo: "5 anos" },
  { meses: 120, rotulo: "10 anos" },
];

const MARCOS = [6, 12, 24, 36, 60, 120];

const moedaCurta = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v);

function rotuloMes(data: string) {
  const [a, m] = data.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
}

function rotuloPrazo(meses: number) {
  if (meses < 12) return `${meses} meses`;
  const anos = meses / 12;
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

interface PrevisaoProps {
  caixinhaId: number;
  isenta: boolean;
  /** Muda quando a caixinha muda (movimento, taxa), para refazer a previsão. */
  versao: string;
}

/** Simulador "quanto vou ter": prazo + depósito mensal opcional. */
export default function PrevisaoCaixinha({ caixinhaId, isenta, versao }: PrevisaoProps) {
  const [meses, setMeses] = useState(12);
  const [aporteTexto, setAporteTexto] = useState("");
  const [aporte, setAporte] = useState(0);
  // A previsão guarda os parâmetros que a geraram: enquanto a nova não chega,
  // a tela continua mostrando a anterior de forma coerente.
  const [previsao, setPrevisao] = useState<{ pontos: PontoPrevisao[]; meses: number; aporte: number } | null>(null);
  const [erro, setErro] = useState(false);

  // Espera o usuário parar de digitar antes de recalcular.
  useEffect(() => {
    const timer = setTimeout(() => {
      const v = lerValor(aporteTexto);
      setAporte(Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0);
    }, 400);
    return () => clearTimeout(timer);
  }, [aporteTexto]);

  useEffect(() => {
    let ativo = true;
    preverCaixinha(caixinhaId, meses, aporte)
      .then((p) => ativo && (setPrevisao({ pontos: p, meses, aporte }), setErro(false)))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, [caixinhaId, meses, aporte, versao]);

  const pontos = previsao?.pontos ?? null;
  const mesesPrevistos = previsao?.meses ?? meses;
  const aportePrevisto = previsao?.aporte ?? 0;
  const final = pontos?.[pontos.length - 1];
  const inicio = pontos?.[0];
  /** Juros gerados entre hoje e o mês `m` (sem contar depósitos novos). */
  const jurosAte = (m: number) =>
    pontos?.[m] && inicio ? pontos[m].saldo - inicio.saldo - aportePrevisto * m : 0;
  const ganhoNoPeriodo = jurosAte(mesesPrevistos);
  // Eixo começa perto do saldo de hoje para o crescimento aparecer.
  const minimoEixo = inicio ? Math.floor((inicio.saldo * 0.9) / 100) * 100 : 0;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-primary">Quanto você vai ter</h2>
          <p className="mt-0.5 text-sm text-muted">Previsão com a taxa de hoje. Escolha o prazo e, se quiser, um depósito mensal.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-1 rounded-[var(--radius-lg)] bg-surface-dim p-1" role="radiogroup" aria-label="Prazo">
            {PRAZOS.map((p) => (
              <button
                key={p.meses}
                type="button"
                role="radio"
                aria-checked={meses === p.meses}
                onClick={() => setMeses(p.meses)}
                className={`h-8 min-w-0 flex-1 whitespace-nowrap rounded-[var(--radius-md)] px-1 text-[11px] font-semibold transition sm:flex-none sm:px-3 sm:text-xs ${
                  meses === p.meses ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                {p.rotulo}
              </button>
            ))}
          </div>
          <label className="form-input-group form-input-group--compact form-input-group--inline">
            <span className="whitespace-nowrap text-xs font-semibold text-muted">+ por mês R$</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              aria-label="Depósito mensal"
              value={aporteTexto}
              onChange={(e) => setAporteTexto(e.target.value)}
              className="form-input-control"
            />
          </label>
        </div>
      </div>

      {erro && <p className="mt-6 text-sm text-expense">Não foi possível calcular a previsão.</p>}

      {final && inicio && !erro && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-accent-light p-4">
              <p className="text-xs font-medium text-accent">Em {rotuloPrazo(mesesPrevistos)} você terá</p>
              <p className="num mt-1 text-2xl font-extrabold text-primary">{formatarMoeda(final.saldo)}</p>
              {!isenta && <p className="num text-xs text-muted">{formatarMoeda(final.liquido)} líquido de IR</p>}
            </div>
            <div className="rounded-2xl bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted">Os juros vão render</p>
              <p className="num mt-1 text-2xl font-extrabold text-income">+ {formatarMoeda(ganhoNoPeriodo)}</p>
              <p className="text-xs text-muted">a partir de hoje</p>
            </div>
            <div className="rounded-2xl bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted">Você terá colocado</p>
              <p className="num mt-1 text-2xl font-extrabold text-foreground">{formatarMoeda(final.investido)}</p>
              <p className="num text-xs text-muted">
                {aportePrevisto > 0
                  ? `inclui ${formatarMoeda(aportePrevisto * mesesPrevistos)} em depósitos`
                  : "sem novos depósitos"}
              </p>
            </div>
          </div>

          <div className="-mx-2 mt-4">
            <LineChart
              height={280}
              margin={{ left: 0, right: 12, top: 16, bottom: 0 }}
              grid={{ horizontal: true }}
              xAxis={[
                {
                  scaleType: "point",
                  data: pontos!.map((p) => rotuloMes(p.data)),
                  tickLabelStyle: { fontSize: 11, fill: "var(--muted)" },
                  tickInterval: (_v: string, i: number) =>
                    i % Math.max(1, Math.ceil(pontos!.length / 7)) === 0 && i < pontos!.length - 1,
                  disableLine: true,
                  disableTicks: true,
                },
              ]}
              yAxis={[{ min: minimoEixo, width: 64, valueFormatter: (v: number) => moedaCurta(v), tickLabelStyle: { fontSize: 11, fill: "var(--muted-light)" }, disableLine: true, disableTicks: true }]}
              series={[
                { data: pontos!.map((p) => p.saldo), label: "Saldo", area: true, color: "var(--accent)", showMark: false, valueFormatter: (v) => formatarMoeda(v ?? 0) },
                { data: pontos!.map((p) => p.investido), label: "Você colocou", color: "var(--chart-7)", showMark: false, valueFormatter: (v) => formatarMoeda(v ?? 0) },
              ]}
              sx={{
                "& .MuiChartsGrid-line": { stroke: "var(--border)", strokeDasharray: "4 4" },
                "& .MuiAreaElement-root": { fillOpacity: 0.18 },
                "& .MuiChartsLegend-label": { fontSize: 12, fill: "var(--muted)" },
              }}
            />
          </div>

          {/* Celular: um cartão por prazo, para nenhuma coluna ficar escondida. */}
          <ul className="mt-4 flex flex-col gap-2 sm:hidden">
            {MARCOS.filter((m) => m <= mesesPrevistos && pontos![m]).map((m) => {
              const p = pontos![m];
              return (
                <li key={m} className="rounded-2xl bg-surface-hover p-4 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-foreground">{rotuloPrazo(m)}</span>
                    <span className="num font-bold text-foreground">{formatarMoeda(p.saldo)}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-muted">Juros a partir de hoje</span>
                    <span className="num font-semibold text-income">+ {formatarMoeda(jurosAte(m))}</span>
                  </div>
                  {!isenta && (
                    <div className="mt-1 flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-muted">Líquido</span>
                      <span className="num text-muted">{formatarMoeda(p.liquido)}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="py-2 font-semibold">Prazo</th>
                  <th className="py-2 text-right font-semibold">Saldo</th>
                  <th className="py-2 text-right font-semibold">Juros a partir de hoje</th>
                  {!isenta && <th className="py-2 text-right font-semibold">Líquido</th>}
                </tr>
              </thead>
              <tbody>
                {MARCOS.filter((m) => m <= mesesPrevistos && pontos![m]).map((m) => {
                  const p = pontos![m];
                  return (
                    <tr key={m} className="border-b border-border last:border-0">
                      <td className="py-2.5 font-medium text-foreground">{rotuloPrazo(m)}</td>
                      <td className="num py-2.5 text-right font-semibold text-foreground">{formatarMoeda(p.saldo)}</td>
                      <td className="num py-2.5 text-right text-income">+ {formatarMoeda(jurosAte(m))}</td>
                      {!isenta && <td className="num py-2.5 text-right text-muted">{formatarMoeda(p.liquido)}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!pontos && !erro && <div className="skeleton mt-6 h-[360px] w-full" />}
    </section>
  );
}
