import api from "./api";
import {
  DadosSimulacao,
  GastarHoje,
  ListaParcelamentos,
  NovoRecorrente,
  Recorrente,
  ResultadoSimulacao,
} from "../types/planejamento";

export async function obterGastarHoje(): Promise<GastarHoje> {
  return (await api.get("/planejamento/gastar-hoje")).data;
}

export async function obterMeta(): Promise<{ metaEconomia: number }> {
  return (await api.get("/planejamento/meta")).data;
}

export async function alterarMeta(metaEconomia: number): Promise<{ metaEconomia: number }> {
  return (await api.patch("/planejamento/meta", { metaEconomia })).data;
}

export async function listarRecorrentes(): Promise<Recorrente[]> {
  return (await api.get("/recorrente")).data;
}

export async function criarRecorrente(dados: NovoRecorrente): Promise<Recorrente> {
  return (await api.post("/recorrente", dados)).data;
}

export async function atualizarRecorrente(
  id: number,
  dados: Partial<NovoRecorrente> & { ativo?: boolean },
): Promise<Recorrente> {
  return (await api.patch(`/recorrente/${id}`, dados)).data;
}

export async function excluirRecorrente(id: number) {
  return (await api.delete(`/recorrente/${id}`)).data;
}

export async function pagarRecorrente(
  id: number,
  dados: { competencia: string; valor?: number; data?: string; contaId?: number },
): Promise<Recorrente> {
  return (await api.post(`/recorrente/${id}/pagar`, dados)).data;
}

export async function pularRecorrente(id: number, competencia: string): Promise<Recorrente> {
  return (await api.post(`/recorrente/${id}/pular`, { competencia })).data;
}

export async function desfazerRecorrente(id: number, competencia: string): Promise<Recorrente> {
  return (await api.delete(`/recorrente/${id}/ocorrencias/${competencia}`)).data;
}

export async function listarParcelamentos(): Promise<ListaParcelamentos> {
  return (await api.get("/parcelamento")).data;
}

export async function rendimentoSugerido(): Promise<{ nome: string; taxaMensal: number } | null> {
  return (await api.get("/parcelamento/rendimento")).data || null;
}

export async function simularParcelamento(dados: DadosSimulacao): Promise<ResultadoSimulacao> {
  return (await api.post("/parcelamento/simular", dados)).data;
}

export async function registrarParcelamento(
  dados: DadosSimulacao & {
    descricao: string;
    parcelasPagas?: number;
    contaId?: number;
    categoriaId?: number;
  },
): Promise<Recorrente> {
  return (await api.post("/parcelamento", dados)).data;
}
