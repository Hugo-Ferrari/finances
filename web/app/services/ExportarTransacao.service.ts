import { formatarData } from "@/app/lib/formatters";
import { listarTodasTransacoes } from "./transacao.service";

/** Gera o .xlsx. Retorna false quando não há transações para exportar. */
export async function exportarTransacoes(): Promise<boolean> {
  const transacoes = await listarTodasTransacoes();
  if (transacoes.length === 0) return false;

  const ExcelJS = await import("exceljs");
  const dados = transacoes.map((transacao) => ({
    Data: formatarData(transacao.data),
    Descrição: transacao.descricao ?? "Sem descrição",
    Tipo: transacao.tipoTransacao === "ENTRADA" ? "Entrada" : "Saída",
    Categoria: transacao.categoria?.nome ?? "Sem categoria",
    Conta: transacao.conta.nome,
    Valor: Number(transacao.valor),
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transações", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  worksheet.autoFilter = `A1:F${dados.length + 1}`;
  worksheet.columns = [
    { header: "Data", key: "Data", width: 14 },
    { header: "Descrição", key: "Descrição", width: 35 },
    { header: "Tipo", key: "Tipo", width: 12 },
    { header: "Categoria", key: "Categoria", width: 20 },
    { header: "Conta", key: "Conta", width: 20 },
    { header: "Valor", key: "Valor", width: 15 },
  ];
  worksheet.addRows(dados);

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF11152F" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  worksheet.getColumn("Valor").numFmt = '"R$" #,##0.00';

  const arquivo = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([arquivo], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "transacoes.xlsx";
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);

  return true;
}
