import * as XLSX from "xlsx";
import { listarTodasTransacoes } from "./transacao.service";

export async function exportarTransacoes() {
  const transacoes = await listarTodasTransacoes();

  const dados = transacoes.map((transacao) => ({
    Data: new Intl.DateTimeFormat("pt-BR").format(
      new Date(transacao.data)
    ),
    Descrição: transacao.descricao ?? "Sem descrição",
    Tipo:
      transacao.tipoTransacao === "ENTRADA"
        ? "Entrada"
        : "Saída",
    Categoria: transacao.categoria?.nome ?? "Sem categoria",
    Conta: transacao.conta.nome,
    Valor: Number(transacao.valor),
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transações"
  );

  XLSX.writeFile(workbook, "transacoes.xlsx");
}