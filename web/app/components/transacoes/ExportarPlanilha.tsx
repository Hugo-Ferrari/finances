"use client";

import { exportarTransacoes } from "@/app/services/ExportarTransacao.service";

function ExportarPlanilha() {
  async function handleExportar() {
    try {
      await exportarTransacoes();
    } catch (error) {
      console.error("Erro ao exportar transações:", error);
    }
  }

  return (
    <button
      onClick={handleExportar}
      className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface hover:-translate-y-0"
    >
      Exportar Excel
    </button>
  );
}

export default ExportarPlanilha;