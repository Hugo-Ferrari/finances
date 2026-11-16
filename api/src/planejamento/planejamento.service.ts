import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hojeNoBrasil, inicioDoDia, fimDoDia } from 'src/common/datas';
import {
  competenciaDe,
  ocorrenciasEntre,
  RecorrenteCalc,
  somarCompetencia,
  somarDias,
} from './calendario';
import { calcularGastarHoje } from './gastar-hoje';

/** Contas que entram no "pode gastar": poupança é dinheiro guardado e fica de fora. */
export const TIPOS_DISPONIVEIS = ['CORRENTE', 'CARTEIRA'] as const;

const dia = (d: Date) => d.toISOString().slice(0, 10);

type RecorrenteDoBanco = {
  id: number;
  descricao: string;
  valor: unknown;
  tipoTransacao: 'ENTRADA' | 'SAIDA';
  inicio: Date;
  parcelasTotal: number | null;
  parcelaInicial: number;
  ehSalario: boolean;
  ativo: boolean;
  criadoEm: Date;
  contaId: number | null;
  ocorrencias: { competencia: string; transacaoId: number | null }[];
};

export function paraCalculo(r: RecorrenteDoBanco): RecorrenteCalc {
  return {
    id: r.id,
    descricao: r.descricao,
    valor: Number(r.valor),
    tipo: r.tipoTransacao,
    inicio: dia(r.inicio),
    parcelasTotal: r.parcelasTotal,
    parcelaInicial: r.parcelaInicial,
    ehSalario: r.ehSalario,
    ativo: r.ativo,
    contaId: r.contaId,
    criadoEm: hojeNoBrasilDe(r.criadoEm),
    ocorrencias: r.ocorrencias.map((o) => ({
      competencia: o.competencia,
      paga: o.transacaoId !== null,
    })),
  };
}

/** Dia (no Brasil) de um instante gravado com a hora. */
function hojeNoBrasilDe(instante: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(instante);
}

/** Taxa mensal equivalente (em %) de uma taxa de caixinha. */
function taxaMensalPercentual(taxa: number, periodo: 'MENSAL' | 'ANUAL') {
  return periodo === 'MENSAL'
    ? taxa
    : (Math.pow(1 + taxa / 100, 1 / 12) - 1) * 100;
}

@Injectable()
export class PlanejamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async recorrentesParaCalculo(usuarioId: number): Promise<RecorrenteCalc[]> {
    const lista = await this.prisma.recorrente.findMany({
      where: { usuarioId },
      include: {
        ocorrencias: { select: { competencia: true, transacaoId: true } },
      },
      orderBy: { id: 'asc' },
    });
    return lista.map(paraCalculo);
  }

  /** "Quanto posso gastar hoje". `extras` simula recorrentes que ainda não existem. */
  async gastarHoje(usuarioId: number, extras: RecorrenteCalc[] = []) {
    const hoje = hojeNoBrasil();
    const inicioMes = inicioDoDia(`${hoje.slice(0, 7)}-01`);

    // Uma rodada só: as consultas filtram pelas contas disponíveis com o
    // próprio filtro (em vez de buscar os ids antes), e tudo vai em paralelo.
    const contaDisponivel = {
      usuarioId,
      ativa: true,
      tipo: { in: [...TIPOS_DISPONIVEIS] },
    };
    const [contas, usuario, recorrentes, gastoHoje, entradasDoMes, movimentos] =
      await Promise.all([
        this.prisma.conta.findMany({
          where: contaDisponivel,
          select: { saldo: true },
        }),
        this.prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { metaEconomia: true },
        }),
        this.recorrentesParaCalculo(usuarioId),
        this.prisma.transacao.aggregate({
          _sum: { valor: true },
          where: {
            conta: contaDisponivel,
            tipoTransacao: 'SAIDA',
            data: { gte: inicioDoDia(hoje), lte: fimDoDia(hoje) },
            // Contas fixas confirmadas não são "gasto do dia": já estavam previstas.
            ocorrenciaRecorrente: { is: null },
          },
        }),
        this.prisma.transacao.aggregate({
          _sum: { valor: true },
          where: {
            conta: contaDisponivel,
            tipoTransacao: 'ENTRADA',
            data: { gte: inicioMes, lte: fimDoDia(hoje) },
          },
        }),
        this.prisma.movimentoCaixinha.findMany({
          where: {
            caixinha: { usuarioId },
            conta: contaDisponivel,
            data: { gte: inicioDoDia(somarDias(hoje, -75)) },
          },
          select: { tipo: true, valor: true, data: true },
        }),
      ]);

    return calcularGastarHoje({
      hoje,
      saldoDisponivel: contas.reduce((t, c) => t + Number(c.saldo), 0),
      recorrentes: [...recorrentes, ...extras],
      metaPercentual: Number(usuario?.metaEconomia ?? 20),
      gastoHoje: Number(gastoHoje._sum.valor ?? 0),
      entradasDoMes: Number(entradasDoMes._sum.valor ?? 0),
      movimentosCaixinha: movimentos.map((m) => ({
        tipo: m.tipo,
        valor: Number(m.valor),
        data: dia(m.data),
      })),
    });
  }

  /**
   * Quanto das saídas fixas e parcelas cai em cada um dos próximos `meses`
   * (a partir do mês atual). `extra` = compra que está sendo simulada.
   */
  async comprometimento(usuarioId: number, extra?: RecorrenteCalc, meses = 12) {
    const recorrentes = (await this.recorrentesParaCalculo(usuarioId)).filter(
      (r) => r.tipo === 'SAIDA',
    );
    const atual = competenciaDe(hojeNoBrasil());
    const somaNoMes = (lista: RecorrenteCalc[], competencia: string) =>
      lista
        .flatMap((r) =>
          ocorrenciasEntre(r, `${competencia}-01`, `${competencia}-31`),
        )
        .filter((o) => o.status !== 'PULADA')
        .reduce((t, o) => t + o.valor, 0);

    return Array.from({ length: meses }, (_, i) => {
      const competencia = somarCompetencia(atual, i);
      const centavos = (v: number) => Math.round(v * 100) / 100;
      return {
        competencia,
        fixas: centavos(
          somaNoMes(
            recorrentes.filter((r) => r.parcelasTotal === null),
            competencia,
          ),
        ),
        parcelas: centavos(
          somaNoMes(
            recorrentes.filter((r) => r.parcelasTotal !== null),
            competencia,
          ),
        ),
        novaCompra: extra ? centavos(somaNoMes([extra], competencia)) : 0,
      };
    });
  }

  /** Melhor rendimento atual entre as caixinhas (em % ao mês), para comparar com o parcelado. */
  async melhorRendimento(usuarioId: number) {
    const hoje = inicioDoDia(hojeNoBrasil());
    const caixinhas = await this.prisma.caixinha.findMany({
      where: { usuarioId },
      select: {
        nome: true,
        taxas: {
          where: { inicio: { lte: hoje } },
          orderBy: { inicio: 'desc' },
          take: 1,
        },
      },
    });
    let melhor: { nome: string; taxaMensal: number } | null = null;
    for (const c of caixinhas) {
      const t = c.taxas[0];
      if (!t) continue;
      const taxaMensal = taxaMensalPercentual(Number(t.taxa), t.periodo);
      if (!melhor || taxaMensal > melhor.taxaMensal)
        melhor = { nome: c.nome, taxaMensal };
    }
    return (
      melhor && {
        nome: melhor.nome,
        taxaMensal: Math.round(melhor.taxaMensal * 10000) / 10000,
      }
    );
  }

  async meta(usuarioId: number) {
    const u = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { metaEconomia: true },
    });
    return { metaEconomia: Number(u?.metaEconomia ?? 20) };
  }

  async alterarMeta(usuarioId: number, metaEconomia: number) {
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { metaEconomia },
    });
    return { metaEconomia };
  }
}
