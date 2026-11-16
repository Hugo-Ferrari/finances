export type PeriodoTaxa = "MENSAL" | "ANUAL";
export type TipoMovimentoCaixinha = "DEPOSITO" | "RETIRADA" | "AJUSTE";

export interface ResumoCaixinha {
  id: number;
  nome: string;
  instituicao: string | null;
  isentaIR: boolean;
  saldo: number;
  liquido: number;
  imposto: number;
  depositado: number;
  retirado: number;
  rendimentoTotal: number;
  rendimentoMes: number;
  rendimentoDia: number;
  taxaAtual: { taxa: number; periodo: PeriodoTaxa } | null;
}

export interface MovimentoCaixinha {
  id: number;
  tipo: TipoMovimentoCaixinha;
  valor: number;
  data: string;
  conta: { id: number; nome: string } | null;
}

export interface Caixinha extends ResumoCaixinha {
  taxas: { id: number; taxa: number; periodo: PeriodoTaxa; inicio: string }[];
  movimentos: MovimentoCaixinha[];
  rendimentosMensais: { mes: string; ate: string; valor: number }[];
}

export interface PontoPrevisao {
  data: string;
  saldo: number;
  investido: number;
  rendimento: number;
  liquido: number;
}

export interface NovaCaixinha {
  nome: string;
  instituicao?: string;
  isentaIR: boolean;
  taxa: number;
  periodo: PeriodoTaxa;
  valorInicial: number;
  dataInicial?: string;
  contaOrigemId?: number;
}
