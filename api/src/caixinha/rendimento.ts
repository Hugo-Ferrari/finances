/**
 * Cálculo de rendimento das caixinhas (funções puras, sem banco).
 *
 * Regras:
 * - O dinheiro rende todo dia, com juros compostos na convenção comercial
 *   30/360: do dia X ao dia X do mês seguinte rende exatamente a taxa mensal,
 *   e cada dia rende 1/30 do mês. O último dia de cada mês conta como dia 30
 *   (fevereiro também), então todo mês completo rende exatamente a taxa.
 *   Assim R$ 1.000 a 1% ao mês viram R$ 1.010,00 após um mês e 1000 × 1,01^12
 *   após um ano. Taxa ao ano vira a mensal equivalente: (1 + i_ano)^(1/12) - 1.
 * - Cada taxa vale a partir do seu dia de início (mudanças não refazem o passado).
 * - Cada depósito é um "lote" com data própria: o imposto de renda (tabela
 *   regressiva) depende da idade de cada lote. Retiradas saem dos lotes mais
 *   antigos primeiro (FIFO), como nos bancos.
 * - AJUSTE substitui o saldo pelo valor informado pelo banco; a diferença
 *   conta como rendimento.
 * - Datas no formato AAAA-MM-DD; o saldo de um dia já inclui os movimentos dele.
 */

export type Periodo = 'MENSAL' | 'ANUAL';
export type TipoMovimento = 'DEPOSITO' | 'RETIRADA' | 'AJUSTE';

export interface Taxa {
  taxa: number; // em %
  periodo: Periodo;
  inicio: string;
}

export interface Movimento {
  tipo: TipoMovimento;
  valor: number;
  data: string;
}

interface Lote {
  principal: number;
  valor: number;
  data: string;
}

export interface Estado {
  lotes: Lote[];
  saldo: number;
  depositado: number;
  retirado: number;
}

export class SaldoInsuficienteError extends Error {
  constructor(public readonly data: string) {
    super(`Saldo insuficiente na caixinha em ${data}`);
  }
}

const DIA_MS = 86_400_000;
const EPSILON = 0.005; // meio centavo

export function diasEntre(de: string, ate: string): number {
  return Math.round(
    (Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS,
  );
}

export function somarDias(dia: string, dias: number): string {
  return new Date(Date.parse(`${dia}T00:00:00Z`) + dias * DIA_MS)
    .toISOString()
    .slice(0, 10);
}

/** Mesmo dia `meses` depois (dia 31 vira o último dia do mês, quando preciso). */
export function somarMeses(dia: string, meses: number): string {
  const [a, m, d] = dia.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(
    Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0),
  ).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}

export function taxaMensal(t: Pick<Taxa, 'taxa' | 'periodo'>): number {
  const i = t.taxa / 100;
  return t.periodo === 'MENSAL' ? i : Math.pow(1 + i, 1 / 12) - 1;
}

/** Posição no calendário comercial 30/360, em meses (o dia 1 de cada mês é um inteiro). */
function emMeses(dia: string): number {
  const [a, m, d] = dia.split('-').map(Number);
  const ultimoDia = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const diaComercial = d === ultimoDia ? 30 : Math.min(d, 30);
  return a * 12 + (m - 1) + (diaComercial - 1) / 30;
}

/** Fator de crescimento entre o fim do dia `de` e o fim do dia `ate`. */
function fator(iMensal: number, de: string, ate: string): number {
  return Math.pow(1 + iMensal, emMeses(ate) - emMeses(de));
}

/** Alíquota do IR (tabela regressiva de renda fixa) pela idade do lote em dias. */
export function aliquotaIR(dias: number): number {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.2;
  if (dias <= 720) return 0.175;
  return 0.15;
}

function ordenarTaxas(taxas: Taxa[]): Taxa[] {
  return [...taxas].sort((a, b) =>
    a.inicio < b.inicio ? -1 : a.inicio > b.inicio ? 1 : 0,
  );
}

function taxaVigente(taxas: Taxa[], dia: string): Taxa | undefined {
  let vigente: Taxa | undefined;
  for (const t of taxas) if (t.inicio <= dia) vigente = t;
  return vigente ?? taxas[0];
}

function somaLotes(lotes: Lote[]) {
  return lotes.reduce((t, l) => t + l.valor, 0);
}

/** Faz os lotes renderem do fim do dia `de` até o fim do dia `ate`. */
function render(lotes: Lote[], taxas: Taxa[], de: string, ate: string) {
  if (ate <= de || lotes.length === 0 || taxas.length === 0) return;
  // Corta no fim da véspera de cada nova taxa: o dia de início já rende com ela.
  const cortes = taxas
    .map((t) => somarDias(t.inicio, -1))
    .filter((d) => d > de && d < ate);
  const pontos = [de, ...cortes, ate];
  for (let i = 0; i < pontos.length - 1; i++) {
    // A taxa que começa no dia X rende a partir da virada para X.
    const vigente = taxaVigente(taxas, somarDias(pontos[i], 1))!;
    const f = fator(taxaMensal(vigente), pontos[i], pontos[i + 1]);
    for (const l of lotes) l.valor *= f;
  }
}

function aplicar(estado: Estado, m: Movimento) {
  const { lotes } = estado;
  if (m.tipo === 'DEPOSITO') {
    lotes.push({ principal: m.valor, valor: m.valor, data: m.data });
    estado.depositado += m.valor;
    return;
  }
  if (m.tipo === 'RETIRADA') {
    if (m.valor > somaLotes(lotes) + EPSILON)
      throw new SaldoInsuficienteError(m.data);
    let restante = m.valor;
    while (restante > EPSILON && lotes.length) {
      const lote = lotes[0];
      const tirar = Math.min(restante, lote.valor);
      lote.principal -= lote.principal * (tirar / lote.valor);
      lote.valor -= tirar;
      restante -= tirar;
      if (lote.valor <= EPSILON) lotes.shift();
    }
    estado.retirado += m.valor;
    return;
  }
  // AJUSTE: passa a valer o saldo informado pelo banco.
  const atual = somaLotes(lotes);
  if (atual <= EPSILON) {
    lotes.length = 0;
    if (m.valor > 0) {
      lotes.push({ principal: m.valor, valor: m.valor, data: m.data });
      estado.depositado += m.valor;
    }
    return;
  }
  const escala = m.valor / atual;
  for (const l of lotes) l.valor *= escala;
}

/** Situação da caixinha no fim do dia `ate`. Lança SaldoInsuficienteError se uma retirada passar do saldo. */
export function calcularEstado(
  taxasIn: Taxa[],
  movimentos: Movimento[],
  ate: string,
): Estado {
  const taxas = ordenarTaxas(taxasIn);
  const ordem = movimentos
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.data <= ate)
    .sort((a, b) =>
      a.m.data < b.m.data ? -1 : a.m.data > b.m.data ? 1 : a.i - b.i,
    );

  const estado: Estado = { lotes: [], saldo: 0, depositado: 0, retirado: 0 };
  let dia: string | null = null;
  for (const { m } of ordem) {
    if (dia !== null) render(estado.lotes, taxas, dia, m.data);
    aplicar(estado, m);
    dia = m.data;
  }
  if (dia !== null) render(estado.lotes, taxas, dia, ate);
  estado.saldo = somaLotes(estado.lotes);
  return estado;
}

export function impostoEstimado(
  estado: Estado,
  ate: string,
  isenta: boolean,
): number {
  if (isenta) return 0;
  return estado.lotes.reduce(
    (t, l) =>
      t +
      Math.max(0, l.valor - l.principal) * aliquotaIR(diasEntre(l.data, ate)),
    0,
  );
}

const centavos = (v: number) => Math.round(v * 100) / 100;

function primeiroDiaDoMes(dia: string) {
  return `${dia.slice(0, 7)}-01`;
}

/** Rendimento entre o fim de `de` e o fim de `ate` (movimentos do período descontados). */
export function rendimentoNoPeriodo(
  taxas: Taxa[],
  movimentos: Movimento[],
  de: string,
  ate: string,
): number {
  const inicio = calcularEstado(taxas, movimentos, de);
  const fim = calcularEstado(taxas, movimentos, ate);
  return (
    fim.saldo -
    fim.depositado +
    fim.retirado -
    (inicio.saldo - inicio.depositado + inicio.retirado)
  );
}

export interface Resumo {
  saldo: number;
  liquido: number;
  imposto: number;
  depositado: number;
  retirado: number;
  rendimentoTotal: number;
  rendimentoMes: number;
  rendimentoDia: number;
  taxaAtual: { taxa: number; periodo: Periodo } | null;
}

export function resumir(
  taxas: Taxa[],
  movimentos: Movimento[],
  hoje: string,
  isenta: boolean,
): Resumo {
  const estado = calcularEstado(taxas, movimentos, hoje);
  const imposto = impostoEstimado(estado, hoje, isenta);
  const vigente = taxaVigente(ordenarTaxas(taxas), hoje);
  const fimMesAnterior = somarDias(primeiroDiaDoMes(hoje), -1);
  return {
    saldo: centavos(estado.saldo),
    liquido: centavos(estado.saldo - imposto),
    imposto: centavos(imposto),
    depositado: centavos(estado.depositado),
    retirado: centavos(estado.retirado),
    rendimentoTotal: centavos(
      estado.saldo - estado.depositado + estado.retirado,
    ),
    rendimentoMes: centavos(
      rendimentoNoPeriodo(taxas, movimentos, fimMesAnterior, hoje),
    ),
    rendimentoDia: vigente
      ? centavos(
          estado.saldo *
            (fator(taxaMensal(vigente), hoje, somarDias(hoje, 1)) - 1),
        )
      : 0,
    taxaAtual: vigente
      ? { taxa: vigente.taxa, periodo: vigente.periodo }
      : null,
  };
}

/** Rendimento de cada mês, do primeiro movimento até hoje (mais recente primeiro). */
export function rendimentosMensais(
  taxas: Taxa[],
  movimentos: Movimento[],
  hoje: string,
) {
  if (movimentos.length === 0) return [];
  const primeiro = movimentos.reduce(
    (min, m) => (m.data < min ? m.data : min),
    movimentos[0].data,
  );
  const linhas: { mes: string; ate: string; valor: number }[] = [];
  let mes = primeiroDiaDoMes(primeiro);
  while (mes <= hoje) {
    const fimDoMes = somarDias(somarMeses(mes, 1), -1);
    const ate = fimDoMes < hoje ? fimDoMes : hoje;
    const valor = rendimentoNoPeriodo(
      taxas,
      movimentos,
      somarDias(mes, -1),
      ate,
    );
    linhas.push({ mes: mes.slice(0, 7), ate, valor: centavos(valor) });
    mes = somarMeses(mes, 1);
  }
  return linhas.reverse();
}

export interface PontoPrevisao {
  data: string;
  saldo: number;
  investido: number;
  rendimento: number;
  liquido: number;
}

/**
 * Projeção mês a mês a partir do estado de hoje, usando a taxa vigente hoje.
 * `aporteMensal` é depositado no fim de cada mês.
 */
export function prever(
  taxas: Taxa[],
  movimentos: Movimento[],
  hoje: string,
  meses: number,
  aporteMensal: number,
  isenta: boolean,
): PontoPrevisao[] {
  const estado = calcularEstado(taxas, movimentos, hoje);
  const vigente = taxaVigente(ordenarTaxas(taxas), hoje);
  const iMensal = vigente ? taxaMensal(vigente) : 0;
  const lotes = estado.lotes.map((l) => ({ ...l }));
  const ponto = (data: string): PontoPrevisao => {
    const saldo = somaLotes(lotes);
    const investido = lotes.reduce((t, l) => t + l.principal, 0);
    const imposto = impostoEstimado({ ...estado, lotes }, data, isenta);
    return {
      data,
      saldo: centavos(saldo),
      investido: centavos(investido),
      rendimento: centavos(saldo - investido),
      liquido: centavos(saldo - imposto),
    };
  };

  const pontos = [ponto(hoje)];
  let anterior = hoje;
  for (let k = 1; k <= meses; k++) {
    const data = somarMeses(hoje, k);
    const f = fator(iMensal, anterior, data);
    for (const l of lotes) l.valor *= f;
    if (aporteMensal > 0)
      lotes.push({ principal: aporteMensal, valor: aporteMensal, data });
    pontos.push(ponto(data));
    anterior = data;
  }
  return pontos;
}
