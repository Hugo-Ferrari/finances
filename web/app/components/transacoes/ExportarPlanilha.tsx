"use client";

import { exportarTransacoes } from "@/app/services/ExportarTransacao.service";

function ExportarPlanilha() {
  async function handleExportar() {
    try {
      const exportou = await exportarTransacoes();
      if (!exportou) alert("Você ainda não tem transações para exportar.");
    } catch (error) {
      console.error("Erro ao exportar transações:", error);
      alert("Não foi possível exportar as transações. Tente novamente.");
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