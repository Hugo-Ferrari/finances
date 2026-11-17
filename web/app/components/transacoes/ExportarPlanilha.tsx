"use client";

import { FileSpreadsheet } from "lucide-react";

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
    <button type="button" onClick={handleExportar} className="btn btn-ghost">
      <FileSpreadsheet size={16} /> Exportar Excel
    </button>
  );
}

export default ExportarPlanilha;