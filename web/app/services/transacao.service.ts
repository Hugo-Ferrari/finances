import api from "./api";

export async function obterResumoTotal() {
  const response = await api.get("/transacao/resumo-total");
  return response.data;
}

export async function listarTodasTransacoes() {
  const response = await api.get("/transacao");
  return response.data;
}
export async function ListarDespesasCategoria() {
  const response = await api.get("/transacao/despesas-por-categoria");
  return response.data;
}

export async function listarPorPeriodo(inicio: string, fim: string) {
  const response = await api.get("/transacao/periodo", {
    params: { inicio, fim },
  });
  return response.data;
}

export async function criarTransacao(dados: CreateTransacao) {
  const response = await api.post("/transacao", dados);
  return response.data;
}
