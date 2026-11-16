/**
 * "Quanto posso gastar hoje" (funções puras, sem banco).
 *
 * Ciclo: de um salário até o próximo. Sem salário cadastrado, o ciclo é o
 * mês (até o último dia).
 *
 *   livre      = saldo disponível − contas a pagar no ciclo − meta que falta guardar
 *   por dia    = livre ÷ dias que faltam (hoje até a véspera do salário)
 *
 * - Saldo disponível: contas corrente e carteira ativas (poupança é dinheiro
 *   guardado e fica de fora).
 * - Contas a pagar: saídas recorrentes ainda não confirmadas com data antes
 *   do próximo salário, inclusive as atrasadas.
 * - Meta: % da renda do ciclo (o salário; sem salário, as entradas do mês),
 *   menos o que já foi para as caixinhas no ciclo.
 * - O valor do dia é fixado no começo do dia: o gasto de hoje é devolvido ao
 *   saldo antes da divisão, para a barra "gasto hoje" fazer sentido.
 * - Entradas que não são salário não entram na conta até chegarem
 *   (é mais seguro não contar com dinheiro que ainda não caiu).
 */
import {
  diasEntre,
  Ocorrencia,
  ocorrenciasEntre,
  pendentesAte,
  RecorrenteCalc,
  somarDias,
} from './calendario';

export interface MovimentoCaixinhaCalc {
  tipo: 'DEPOSITO' | 'RETIRADA' | 'AJUSTE';
  valor: number;
  data: string;
}

export interface EntradaGastarHoje {
  hoje: string;
  saldoDisponivel: number;
  recorrentes: RecorrenteCalc[];
  /** % da renda que a pessoa quer guardar (ex.: 20). */
  metaPercentual: number;
  /** Saídas avulsas de hoje nas contas disponíveis (sem as contas fixas). */
  gastoHoje: number;
  /** Entradas (transações) do mês atual: renda quando não há salário cadastrado. */
  entradasDoMes: number;
  /** Depósitos/retiradas em caixinhas feitos a partir das contas disponíveis. */
  movimentosCaixinha: MovimentoCaixinhaCalc[];
}

export type EstadoGastarHoje = 'OK' | 'ACIMA' | 'NEGATIVO';

export interface EventoDia {
  descricao: string;
  valor: number;
  tipo: 'ENTRADA' | 'SAIDA';
  ehSalario: boolean;
  paga: boolean;
  parcela: number | null;
  parcelasTotal: number | null;
}

export interface DiaPlanejado {
  data: string;
  /** Quanto dá para gastar no dia (null no dia do salário). */
  porDia: number | null;
  eventos: EventoDia[];
}

export interface ContaAPagar extends Ocorrencia {
  atrasada: boolean;
}

export interface ResultadoGastarHoje {
  hoje: string;
  porDia: number;
  gastoHoje: number;
  restanteHoje: number;
  /** O que sobra até o fim do ciclo depois do gasto de hoje. */
  livre: number;
  dias: number;
  /** Primeiro dia do próximo ciclo (dia do salário ou dia 1º do mês seguinte). */
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
  estado: EstadoGastarHoje;
  contas: ContaAPagar[];
  proximosDias: DiaPlanejado[];
}

const centavos = (v: number) => Math.round(v * 100) / 100;
/** Arredonda para baixo: melhor sobrar um centavo do que faltar. */
const centavosAbaixo = (v: number) => Math.floor(v * 100 + 1e-6) / 100;

function salarios(recorrentes: RecorrenteCalc[]) {
  return recorrentes.filter(
    (r) => r.ativo && r.ehSalario && r.tipo === 'ENTRADA',
  );
}

/** Próximo salário depois de hoje e o último até hoje. */
function cicloDoSalario(recorrentes: RecorrenteCalc[], hoje: string) {
  const lista = salarios(recorrentes);
  const futuros = lista
    .flatMap((r) =>
      ocorrenciasEntre(r, somarDias(hoje, 1), somarDias(hoje, 70)),
    )
    .filter((o) => o.status !== 'PULADA')
    .sort((a, b) => a.data.localeCompare(b.data));
  const passados = lista
    .flatMap((r) => ocorrenciasEntre(r, somarDias(hoje, -70), hoje))
    .filter((o) => o.status !== 'PULADA')
    .sort((a, b) => b.data.localeCompare(a.data));
  return { proximo: futuros[0] ?? null, anterior: passados[0] ?? null };
}

function primeiroDiaDoMesSeguinte(hoje: string): string {
  const [ano, mes] = hoje.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes, 1));
  return d.toISOString().slice(0, 10);
}

export function calcularGastarHoje(e: EntradaGastarHoje): ResultadoGastarHoje {
  const { hoje } = e;
  const { proximo, anterior } = cicloDoSalario(e.recorrentes, hoje);

  const fimCiclo = proximo?.data ?? primeiroDiaDoMesSeguinte(hoje);
  const inicioCiclo = anterior?.data ?? `${hoje.slice(0, 7)}-01`;
  const dias = Math.max(1, diasEntre(hoje, fimCiclo));
  const ultimoDiaDoCiclo = somarDias(fimCiclo, -1);

  // Contas a pagar até a véspera do próximo ciclo (inclusive atrasadas).
  const contas: ContaAPagar[] = e.recorrentes
    .filter((r) => r.tipo === 'SAIDA')
    .flatMap((r) => pendentesAte(r, ultimoDiaDoCiclo))
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((o) => ({ ...o, atrasada: o.data < hoje }));
  const totalContas = centavos(contas.reduce((t, c) => t + c.valor, 0));

  // Meta de guardar: % da renda do ciclo, menos o que já foi para caixinhas.
  const rendaBase = anterior?.valor ?? proximo?.valor ?? e.entradasDoMes;
  const metaGuardar = centavos((rendaBase * e.metaPercentual) / 100);
  const jaGuardado = centavos(
    Math.max(
      0,
      e.movimentosCaixinha
        .filter((m) => m.data >= inicioCiclo && m.data <= hoje)
        .reduce(
          (t, m) =>
            m.tipo === 'DEPOSITO'
              ? t + m.valor
              : m.tipo === 'RETIRADA'
                ? t - m.valor
                : t,
          0,
        ),
    ),
  );
  const metaRestante = centavos(Math.max(0, metaGuardar - jaGuardado));

  // Valor do dia fixado no começo do dia (devolve o gasto de hoje).
  const livreInicio =
    e.saldoDisponivel + e.gastoHoje - totalContas - metaRestante;
  const porDia = centavosAbaixo(Math.max(0, livreInicio) / dias);
  const livre = centavos(livreInicio - e.gastoHoje);
  const restanteHoje = centavos(porDia - e.gastoHoje);
  const estado: EstadoGastarHoje =
    livreInicio <= 0 ? 'NEGATIVO' : restanteHoje < 0 ? 'ACIMA' : 'OK';

  const porDiaSeguintes =
    dias > 1 ? centavosAbaixo(Math.max(0, livre) / (dias - 1)) : 0;

  // Próximos 7 dias (até o dia do salário, inclusive).
  const eventosPorDia = new Map<string, EventoDia[]>();
  const ultimoMostrado = somarDias(hoje, 6);
  for (const r of e.recorrentes) {
    for (const o of ocorrenciasEntre(r, hoje, ultimoMostrado)) {
      if (o.status === 'PULADA') continue;
      const lista = eventosPorDia.get(o.data) ?? [];
      lista.push({
        descricao: o.descricao,
        valor: o.valor,
        tipo: o.tipo,
        ehSalario: o.ehSalario,
        paga: o.status === 'PAGA',
        parcela: o.parcela,
        parcelasTotal: o.parcelasTotal,
      });
      eventosPorDia.set(o.data, lista);
    }
  }
  const proximosDias: DiaPlanejado[] = [];
  for (let i = 0; i < 7; i++) {
    const data = somarDias(hoje, i);
    if (data > fimCiclo) break;
    const eventos = eventosPorDia.get(data) ?? [];
    if (data === fimCiclo) {
      // Dia do salário (ou 1º do mês seguinte, quando não há salário): fim do ciclo.
      if (proximo) proximosDias.push({ data, porDia: null, eventos });
      break;
    }
    proximosDias.push({
      data,
      porDia: i === 0 ? porDia : porDiaSeguintes,
      eventos,
    });
  }

  return {
    hoje,
    porDia,
    gastoHoje: centavos(e.gastoHoje),
    restanteHoje,
    livre,
    dias,
    fimCiclo,
    inicioCiclo,
    proximoSalario: proximo
      ? {
          descricao: proximo.descricao,
          valor: proximo.valor,
          data: proximo.data,
        }
      : null,
    saldoDisponivel: centavos(e.saldoDisponivel),
    totalContas,
    metaPercentual: e.metaPercentual,
    rendaBase: centavos(rendaBase),
    metaGuardar,
    jaGuardado,
    metaRestante,
    estado,
    contas,
    proximosDias,
  };
}

/** "E se eu gastar X hoje?": quanto sobra por dia nos dias seguintes. */
export function simularGasto(r: ResultadoGastarHoje, valor: number) {
  const livreDepois = centavos(r.livre - valor);
  const porDiaDepois =
    r.dias > 1
      ? centavosAbaixo(Math.max(0, livreDepois) / (r.dias - 1))
      : Math.max(0, livreDepois);
  return { livreDepois, porDiaDepois };
}
