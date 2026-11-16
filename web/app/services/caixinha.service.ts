import api from "./api";
import {
  Caixinha,
  NovaCaixinha,
  PeriodoTaxa,
  PontoPrevisao,
  ResumoCaixinha,
  TipoMovimentoCaixinha,
} from "../types/caixinha";

export async function listarCaixinhas(): Promise<ResumoCaixinha[]> {
  return (await api.get("/caixinha")).data;
}

export async function buscarCaixinha(id: number): Promise<Caixinha> {
  return (await api.get(`/caixinha/${id}`)).data;
}

export async function criarCaixinha(dados: NovaCaixinha): Promise<Caixinha> {
  return (await api.post("/caixinha", dados)).data;
}

export async function atualizarCaixinha(
  id: number,
  dados: { nome?: string; instituicao?: string; isentaIR?: boolean },
): Promise<Caixinha> {
  return (await api.patch(`/caixinha/${id}`, dados)).data;
}

export async function alterarTaxa(
  id: number,
  dados: { taxa: number; periodo: PeriodoTaxa; inicio?: string },
): Promise<Caixinha> {
  return (await api.post(`/caixinha/${id}/taxa`, dados)).data;
}

export async function registrarMovimento(
  id: number,
  dados: { tipo: TipoMovimentoCaixinha; valor: number; data?: string; contaId?: number },
): Promise<Caixinha> {
  return (await api.post(`/caixinha/${id}/movimentos`, dados)).data;
}

export async function removerMovimento(id: number, movimentoId: number): Promise<Caixinha> {
  return (await api.delete(`/caixinha/${id}/movimentos/${movimentoId}`)).data;
}

export async function excluirCaixinha(id: number) {
  return (await api.delete(`/caixinha/${id}`)).data;
}

export async function preverCaixinha(
  id: number,
  meses: number,
  aporteMensal: number,
): Promise<PontoPrevisao[]> {
  return (await api.get(`/caixinha/${id}/previsao`, { params: { meses, aporteMensal } })).data;
}
