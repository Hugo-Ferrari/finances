/**
 * Calendário dos lançamentos recorrentes (funções puras, sem banco).
 *
 * Um Recorrente acontece todo mês no dia da sua primeira ocorrência
 * (`inicio`). Em meses mais curtos vale o último dia (31 → 30/11, 28/02).
 * Compras parceladas param depois da última parcela.
 *
 * Cada mês ("competência", AAAA-MM) pode estar:
 * - PAGA: confirmada pela pessoa (virou uma transação);
 * - PULADA: a pessoa disse que não vai acontecer neste mês;
 * - PENDENTE: ainda não foi confirmada.
 *
 * Datas no formato AAAA-MM-DD, como no resto da API.
 */

export type TipoLancamento = 'ENTRADA' | 'SAIDA';
export type StatusOcorrencia = 'PAGA' | 'PULADA' | 'PENDENTE';

export interface RecorrenteCalc {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  inicio: string;
  parcelasTotal: number | null;
  parcelaInicial: number;
  ehSalario: boolean;
  ativo: boolean;
  /** Conta cadastrada para pagar/receber (sugestão na hora de confirmar). */
  contaId?: number | null;
  /** Dia do cadastro: meses anteriores a ele não contam como atrasados. */
  criadoEm: string;
  /** Meses já resolvidos: paga = virou transação; false = pulado. */
  ocorrencias: { competencia: string; paga: boolean }[];
}

export interface Ocorrencia {
  recorrenteId: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  ehSalario: boolean;
  data: string;
  competencia: string;
  /** Número da parcela (só compras parceladas). */
  parcela: number | null;
  parcelasTotal: number | null;
  status: StatusOcorrencia;
  contaId: number | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

export function competenciaDe(dia: string): string {
  return dia.slice(0, 7);
}

/** Soma meses a uma competência (AAAA-MM). */
export function somarCompetencia(competencia: string, meses: number): string {
  const [ano, mes] = competencia.split('-').map(Number);
  const total = ano * 12 + (mes - 1) + meses;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

/** Quantos meses de `de` até `ate` (competências). */
export function mesesEntre(de: string, ate: string): number {
  const [a1, m1] = de.split('-').map(Number);
  const [a2, m2] = ate.split('-').map(Number);
  return (a2 - a1) * 12 + (m2 - m1);
}

export function somarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function diasEntre(de: string, ate: string): number {
  return Math.round(
    (Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) /
      86_400_000,
  );
}

/** Dia em que o recorrente acontece numa competência. */
export function dataNaCompetencia(inicio: string, competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number);
  const dia = Math.min(Number(inicio.slice(8, 10)), ultimoDiaDoMes(ano, mes));
  return `${competencia}-${pad(dia)}`;
}

/** Número da parcela numa competência (null se não é parcelado). */
export function parcelaNaCompetencia(
  r: Pick<RecorrenteCalc, 'inicio' | 'parcelaInicial' | 'parcelasTotal'>,
  competencia: string,
): number | null {
  if (r.parcelasTotal === null) return null;
  return r.parcelaInicial + mesesEntre(competenciaDe(r.inicio), competencia);
}

/** A competência é um mês em que o recorrente acontece? */
export function ehCompetenciaValida(
  r: Pick<RecorrenteCalc, 'inicio' | 'parcelaInicial' | 'parcelasTotal'>,
  competencia: string,
): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competencia)) return false;
  if (competencia < competenciaDe(r.inicio)) return false;
  const parcela = parcelaNaCompetencia(r, competencia);
  return parcela === null || parcela <= (r.parcelasTotal ?? 0);
}

/** Competência da última parcela (null se não tem fim). */
export function ultimaCompetencia(
  r: Pick<RecorrenteCalc, 'inicio' | 'parcelaInicial' | 'parcelasTotal'>,
): string | null {
  if (r.parcelasTotal === null) return null;
  return somarCompetencia(
    competenciaDe(r.inicio),
    r.parcelasTotal - r.parcelaInicial,
  );
}

/** Todas as ocorrências com data entre `de` e `ate` (inclusive). */
export function ocorrenciasEntre(
  r: RecorrenteCalc,
  de: string,
  ate: string,
): Ocorrencia[] {
  if (!r.ativo || ate < r.inicio) return [];
  const resolvidas = new Map(r.ocorrencias.map((o) => [o.competencia, o.paga]));
  const ultima = ultimaCompetencia(r);
  const lista: Ocorrencia[] = [];

  // Começa no mês de `de` (ou no início, se for depois) e vai até o mês de `ate`.
  let competencia = competenciaDe(r.inicio > de ? r.inicio : de);
  const fim = competenciaDe(ate);
  while (competencia <= fim && (ultima === null || competencia <= ultima)) {
    const data = dataNaCompetencia(r.inicio, competencia);
    if (data >= de && data <= ate && data >= r.inicio) {
      const resolvida = resolvidas.get(competencia);
      lista.push({
        recorrenteId: r.id,
        descricao: r.descricao,
        valor: r.valor,
        tipo: r.tipo,
        ehSalario: r.ehSalario,
        data,
        competencia,
        parcela: parcelaNaCompetencia(r, competencia),
        parcelasTotal: r.parcelasTotal,
        status:
          resolvida === undefined ? 'PENDENTE' : resolvida ? 'PAGA' : 'PULADA',
        contaId: r.contaId ?? null,
      });
    }
    competencia = somarCompetencia(competencia, 1);
  }
  return lista;
}

/**
 * Ocorrências pendentes até `ate`, inclusive as atrasadas. Meses anteriores
 * ao cadastro não contam (a pessoa já pagou antes de usar o app).
 */
export function pendentesAte(r: RecorrenteCalc, ate: string): Ocorrencia[] {
  const desde = `${competenciaDe(r.criadoEm)}-01`;
  return ocorrenciasEntre(r, desde, ate).filter((o) => o.status === 'PENDENTE');
}

/** Próxima ocorrência pendente a partir de `dia` (inclusive). */
export function proximaPendente(
  r: RecorrenteCalc,
  dia: string,
): Ocorrencia | null {
  return (
    ocorrenciasEntre(r, dia, somarDias(dia, 400)).find(
      (o) => o.status === 'PENDENTE',
    ) ?? null
  );
}
