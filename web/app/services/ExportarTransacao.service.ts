import { formatarData } from "@/app/lib/formatters";
import * as XLSX from "xlsx";
import { listarTodasTransacoes } from "./transacao.service";

/** Gera o .xlsx. Retorna false quando não há transações para exportar. */
export async function exportarTransacoes(): Promise<boolean> {
  const transacoes = await listarTodasTransacoes();
  if (transacoes.length === 0) return false;

  const dados = transacoes.map((transacao) => ({
    Data: formatarData(transacao.data),
    Descrição: transacao.descricao ?? "Sem descrição",
    Tipo: transacao.tipoTransacao === "ENTRADA" ? "Entrada" : "Saída",
    Categoria: transacao.categoria?.nome ?? "Sem categoria",
    Conta: transacao.conta.nome,
    Valor: Number(transacao.valor),
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);
  worksheet["!cols"] = [
    { wch: 14 }, // Data
    { wch: 35 }, // Descrição
    { wch: 12 }, // Tipo
    { wch: 20 }, // Categoria
    { wch: 20 }, // Conta
    { wch: 15 }, // Valor
  ];
  const cabecalho = ["A1", "B1", "C1", "D1", "E1", "F1"];

  cabecalho.forEach((celula) => {
    worksheet[celula].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "11152F" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  });

  for (let i = 2; i <= dados.length + 1; i++) {
    worksheet[`F${i}`].z = "R$ #,##0.00";
  }

  worksheet["!autofilter"] = {
    ref: `A1:F${dados.length + 1}`,
  };
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

  XLSX.writeFile(workbook, "transacoes.xlsx");
  return true;
}
