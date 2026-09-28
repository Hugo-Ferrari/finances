import { CreateTransacao, Transacao } from "../types/transacao";
import api from "./api";

export async function obterResumoTotal() {
  const response = await api.get("/transacao/resumo-total");
  return response.data;
}

export async function listarTodasTransacoes(): Promise<Transacao[]> {
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

export async function enviarTransacaoParaApi(dados: CreateTransacao) {
  const response = await api.post("/transacao", dados);

  return response.data;
}

export async function criarTransacao(dados: CreateTransacao) {
  console.log("ONLINE:", navigator.onLine);
  if (!navigator.onLine) {
     console.log("ENTROU NA FILA POR OFFLINE");
    const { adicionarNaFila } = await import("./offline/transacao.queue");

    await adicionarNaFila(dados);

    return {
      offline: true,
      dados,
    };
  }

  try {
    console.log("TENTANDO API");
    return await enviarTransacaoParaApi(dados);
  } catch (error) {
    console.log("API FALHOU, ADICIONANDO NA FILA");
    const { adicionarNaFila } = await import("./offline/transacao.queue");

    await adicionarNaFila(dados);

    return {
      offline: true,
      dados,
    };
  }
}
