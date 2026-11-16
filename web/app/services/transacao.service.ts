import { CreateTransacao, Transacao } from "../types/transacao";
import api from "./api";
import { useAuthStore } from "../store/auth.store";
import { ehFalhaDeConexao } from "../lib/erros";

export async function listarTodasTransacoes(): Promise<Transacao[]> {
  const response = await api.get("/transacao");
  return response.data;
}
/** Sem período: todas as despesas. Com período (AAAA-MM-DD): só as do intervalo. */
export async function ListarDespesasCategoria(periodo?: {
  inicio: string;
  fim: string;
}) {
  const response = await api.get("/transacao/despesas-por-categoria", {
    params: periodo,
  });
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

export type ResultadoCriacao = { offline: true } | { offline: false };

async function guardarNaFila(dados: CreateTransacao): Promise<ResultadoCriacao> {
  const { adicionarNaFila } = await import("./offline/transacao.queue");
  await adicionarNaFila(dados, useAuthStore.getState().usuario?.id);
  return { offline: true };
}

/**
 * Envia a transação. Só guarda na fila offline quando não há conexão;
 * erros devolvidos pela API (ex.: saldo insuficiente) sobem para a tela.
 */
export async function criarTransacao(
  dados: CreateTransacao,
): Promise<ResultadoCriacao> {
  if (!navigator.onLine) {
    return guardarNaFila(dados);
  }

  try {
    await enviarTransacaoParaApi(dados);
    return { offline: false };
  } catch (error) {
    if (ehFalhaDeConexao(error)) {
      return guardarNaFila(dados);
    }
    throw error;
  }
}
