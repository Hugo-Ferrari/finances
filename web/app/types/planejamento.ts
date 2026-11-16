export type TipoLancamento = "ENTRADA" | "SAIDA";
export type StatusOcorrencia = "PAGA" | "PULADA" | "PENDENTE";

export type Ocorrencia = {
  recorrenteId: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  ehSalario: boolean;
  data: string;
  competencia: string;
  parcela: number | null;
  parcelasTotal: number | null;
  status: StatusOcorrencia;
  contaId: number | null;
};

export type ContaAPagar = Ocorrencia & { atrasada: boolean };

export type EventoDia = {
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  ehSalario: boolean;
  paga: boolean;
  parcela: number | null;
  parcelasTotal: number | null;
};

export type DiaPlanejado = { data: string; porDia: number | null; eventos: EventoDia[] };

export type GastarHoje = {
  hoje: string;
  porDia: number;
  gastoHoje: number;
  restanteHoje: number;
  livre: number;
  dias: number;
  fimCiclo: string;
  inicioCiclo: string;
  proximoSalario: { descricao: string; valor: number; data: string } | null;
  saldoDisponivel: number;
  totalContas: number;
  metaPercentual: number;
  rendaBase: number;
  metaGuardar: number;
  jaGuardado: number;
  metaRestante: number;
  estado: "OK" | "ACIMA" | "NEGATIVO";
  contas: ContaAPagar[];
  proximosDias: DiaPlanejado[];
};

export type ProgressoParcelas = {
  pagas: number;
  restantes: number;
  valorRestante: number;
  ultimaParcela: string;
  quitada: boolean;
};

export type Recorrente = {
  id: number;
  descricao: string;
  valor: number;
  tipoTransacao: TipoLancamento;
  inicio: string;
  diaDoMes: number;
  ehSalario: boolean;
  ativo: boolean;
  parcelasTotal: number | null;
  parcelaInicial: number;
  valorAVista: number | null;
  conta: { id: number; nome: string } | null;
  categoria: { id: number; nome: string } | null;
  mesAtual: {
    competencia: string;
    data: string;
    status: StatusOcorrencia;
    parcela: number | null;
    transacaoId: number | null;
  } | null;
  pendentes: { competencia: string; data: string; parcela: number | null; atrasada: boolean }[];
  proxima: { competencia: string; data: string; parcela: number | null } | null;
  parcelamento: ProgressoParcelas | null;
};

export type NovoRecorrente = {
  descricao: string;
  valor: number;
  tipoTransacao: TipoLancamento;
  inicio: string;
  contaId?: number;
  categoriaId?: number;
  ehSalario?: boolean;
};

export type MesComprometido = {
  competencia: string;
  fixas: number;
  parcelas: number;
  novaCompra: number;
};

export type DadosSimulacao = {
  valor: number;
  parcelas: number;
  valorParcela?: number;
  taxaJuros?: number;
  descontoAVista?: number;
  rendimentoMensal?: number;
  primeiraParcela: string;
};

export type ResultadoSimulacao = {
  precoAVista: number;
  parcela: number;
  parcelas: number;
  totalParcelado: number;
  custoParcelar: number;
  taxaMensal: number;
  taxaAnual: number;
  rendimentoMensal: number;
  valorPresente: number;
  melhor: "A_VISTA" | "PARCELADO" | "TANTO_FAZ";
  economia: number;
  cronograma: { numero: number; data: string; valor: number }[];
  rendimentoSugerido: { nome: string; taxaMensal: number } | null;
  impactoHoje: { porDiaAntes: number; porDiaDepois: number; parcelasNoCiclo: number };
  comprometimento: MesComprometido[];
};

export type ListaParcelamentos = {
  compras: Recorrente[];
  totalRestante: number;
  porMes: number;
  comprometimento: MesComprometido[];
};
