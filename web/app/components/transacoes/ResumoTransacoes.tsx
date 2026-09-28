"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { listarPorPeriodo } from "@/app/services/transacao.service";
import { useEffect, useState } from "react";
import { Transacao } from "@/app/types/transacao";

type DadosGrafico = {
  chave: string;
  mes: string;
  entradas: number;
  saidas: number;
};

function ResumoTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [incomeColor, setIncomeColor] = useState("#18a878");
  const [expenseColor, setExpenseColor] = useState("#d94f4f");
  const [mutedColor, setMutedColor] = useState("#73758b");
  const [borderColor, setBorderColor] = useState("#e8e9ef");

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);

    setIncomeColor(root.getPropertyValue("--income").trim() || "#18a878");

    setExpenseColor(root.getPropertyValue("--expense").trim() || "#d94f4f");

    setMutedColor(root.getPropertyValue("--muted").trim() || "#73758b");

    setBorderColor(root.getPropertyValue("--border").trim() || "#e8e9ef");
  }, []);

  useEffect(() => {
    async function carregarPorPeriodo() {
      try {
        setCarregando(true);
        setErro(false);

        const hoje = new Date();

        const dataFinal = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        const dataInicial = new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 5,
          1,
        );

        const formatarData = (data: Date) => {
          const ano = data.getFullYear();
          const mes = String(data.getMonth() + 1).padStart(2, "0");
          const dia = String(data.getDate()).padStart(2, "0");

          return `${ano}-${mes}-${dia}`;
        };

        const dados = await listarPorPeriodo(
          formatarData(dataInicial),
          formatarData(dataFinal),
        );

        setTransacoes(dados);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarPorPeriodo();
  }, []);

  const criarUltimosSeisMeses = (): DadosGrafico[] => {
    const hoje = new Date();

    const meses: DadosGrafico[] = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);

      const ano = data.getFullYear();
      const mesNumero = data.getMonth();

      const chave = `${ano}-${String(mesNumero + 1).padStart(2, "0")}`;

      const mes = data
        .toLocaleDateString("pt-BR", {
          month: "short",
        })
        .replace(".", "");

      meses.push({
        chave,
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        entradas: 0,
        saidas: 0,
      });
    }

    return meses;
  };

  const dadosGraficoArray = (() => {
    const meses = criarUltimosSeisMeses();

    transacoes.forEach((transacao) => {
      const data = new Date(transacao.data);

      const ano = data.getFullYear();
      const mesNumero = data.getMonth();

      const chave = `${ano}-${String(mesNumero + 1).padStart(2, "0")}`;

      const mes = meses.find((item) => item.chave === chave);

      if (!mes) {
        return;
      }

      const valor = Number(transacao.valor);

      if (transacao.tipoTransacao === "ENTRADA") {
        mes.entradas += valor;
      }

      if (transacao.tipoTransacao === "SAIDA") {
        mes.saidas += valor;
      }
    });

    return meses;
  })();

  const totalEntradas = dadosGraficoArray.reduce(
    (total, item) => total + item.entradas,
    0,
  );

  const totalSaidas = dadosGraficoArray.reduce(
    (total, item) => total + item.saidas,
    0,
  );

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  if (carregando) {
    return (
      <div className="flex flex-col bg-surface rounded-2xl border border-surface-dim p-6 gap-6">
        <div>
          <h1 className="text-lg font-semibold">Resumo de transações</h1>

          <p className="text-sm text-muted mt-1">
            Acompanhe suas entradas e saídas ao longo dos meses
          </p>
        </div>

        <div className="h-[320px] flex items-center justify-center">
          <p className="text-sm text-muted">Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col bg-surface rounded-2xl border border-surface-dim p-6 gap-6">
        <div>
          <h1 className="text-lg font-semibold">Resumo de transações</h1>

          <p className="text-sm text-muted mt-1">
            Acompanhe suas entradas e saídas ao longo dos meses
          </p>
        </div>

        <div className="h-[320px] flex items-center justify-center">
          <p className="text-sm text-expense">
            Não foi possível carregar as transações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface rounded-2xl border border-surface-dim p-6 gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Resumo de transações</h1>

          <p className="text-sm text-muted mt-1">
            Acompanhe suas entradas e saídas ao longo dos meses
          </p>
        </div>

        <span className="text-xs font-medium text-muted bg-surface-dim px-3 py-1.5 rounded-lg">
          Últimos 6 meses
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-surface-dim p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-income" />

            <span className="text-income text-sm font-medium">Entradas</span>
          </div>

          <p className="text-xl font-bold">{formatarMoeda(totalEntradas)}</p>
        </div>

        <div className="rounded-xl border border-surface-dim p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-expense" />

            <span className="text-expense text-sm font-medium">Saídas</span>
          </div>

          <p className="text-xl font-bold">{formatarMoeda(totalSaidas)}</p>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: dadosGraficoArray.map((item) => item.mes),
              tickLabelStyle: {
                fontSize: 12,
                fill: "var(--muted)",
              },
            },
          ]}
          yAxis={[
            {
              width: 70,
              tickLabelStyle: {
                fontSize: 11,
                fill: "var(--muted)",
              },
              valueFormatter: (valor: number) => formatarMoeda(valor),
            },
          ]}
          series={[
            {
              data: dadosGraficoArray.map((item) => item.entradas),
              label: "Entradas",
              color: "var(--primary)",
            },
            {
              data: dadosGraficoArray.map((item) => item.saidas),
              label: "Saídas",
              color: "var(--secondary)",
            },
          ]}
          height={320}
          borderRadius={6}
          margin={{
            left: 10,
            right: 20,
            top: 20,
            bottom: 30,
          }}
          grid={{
            horizontal: true,
          }}
          sx={{
            "& .MuiChartsLegend-label": {
              fontSize: 12,
              fill: "var(--muted)",
            },

            "& .MuiChartsGrid-line": {
              stroke: "var(--border)",
              strokeDasharray: "4 4",
            },

            "& .MuiChartsAxis-line": {
              stroke: "var(--border)",
            },

            "& .MuiChartsAxis-tick": {
              stroke: "var(--border)",
            },
          }}
        />
      </div>
    </div>
  );
}

export default ResumoTransacoes;
