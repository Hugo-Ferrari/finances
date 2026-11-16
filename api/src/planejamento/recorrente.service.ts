import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransacaoService } from 'src/transacao/transacao.service';
import { hojeNoBrasil, inicioDoDia } from 'src/common/datas';
import {
  competenciaDe,
  dataNaCompetencia,
  ehCompetenciaValida,
  ocorrenciasEntre,
  parcelaNaCompetencia,
  pendentesAte,
  proximaPendente,
  RecorrenteCalc,
  ultimaCompetencia,
} from './calendario';
import { paraCalculo } from './planejamento.service';
import {
  AtualizarRecorrenteDto,
  CriarRecorrenteDto,
  PagarRecorrenteDto,
} from './dto/planejamento.dto';

/** Valor em reais com 2 casas: o número do JS (99.9) vira 99.90000000000001 no Decimal do banco. */
const dinheiro = (v: number) => new Decimal(v.toFixed(2));
const dinheiroOpcional = (v: number | undefined) =>
  v === undefined ? undefined : dinheiro(v);

const incluir = {
  ocorrencias: { select: { competencia: true, transacaoId: true } },
  conta: { select: { id: true, nome: true } },
  categoria: { select: { id: true, nome: true } },
} satisfies Prisma.RecorrenteInclude;

type RecorrenteCompleto = Prisma.RecorrenteGetPayload<{
  include: typeof incluir;
}>;

/** Resumo de uma compra parcelada (null se não é parcelado). */
export function progressoParcelas(r: RecorrenteCalc) {
  if (r.parcelasTotal === null) return null;
  const resolvidas = r.ocorrencias.length;
  const pagas = Math.min(r.parcelasTotal, r.parcelaInicial - 1 + resolvidas);
  const restantes = r.parcelasTotal - pagas;
  const ultima = ultimaCompetencia(r)!;
  return {
    pagas,
    restantes,
    valorRestante: Math.round(restantes * r.valor * 100) / 100,
    ultimaParcela: dataNaCompetencia(r.inicio, ultima),
    quitada: restantes === 0,
  };
}

@Injectable()
export class RecorrenteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transacaoService: TransacaoService,
  ) {}

  private async buscar(id: number, usuarioId: number) {
    const r = await this.prisma.recorrente.findFirst({
      where: { id, usuarioId },
      include: incluir,
    });
    if (!r) throw new NotFoundException('Conta fixa não encontrada');
    return r;
  }

  private async validarVinculos(
    usuarioId: number,
    contaId?: number | null,
    categoriaId?: number | null,
  ) {
    if (contaId) {
      const conta = await this.prisma.conta.findFirst({
        where: { id: contaId, usuarioId },
      });
      if (!conta)
        throw new ForbiddenException(
          'Conta não encontrada ou não pertence a você',
        );
    }
    if (categoriaId) {
      const cat = await this.prisma.categoria.findFirst({
        where: { id: categoriaId, usuarioId },
      });
      if (!cat)
        throw new ForbiddenException(
          'Categoria não encontrada ou não pertence a você',
        );
    }
  }

  private validarRegras(d: {
    tipoTransacao: 'ENTRADA' | 'SAIDA';
    ehSalario: boolean;
    parcelasTotal: number | null;
    parcelaInicial: number;
  }) {
    if (d.ehSalario && d.tipoTransacao !== 'ENTRADA')
      throw new BadRequestException(
        'Só uma entrada pode ser marcada como salário',
      );
    if (d.parcelasTotal !== null && d.parcelaInicial > d.parcelasTotal)
      throw new BadRequestException(
        'A parcela inicial passa do total de parcelas',
      );
  }

  /** Formato devolvido para a tela. */
  montar(r: RecorrenteCompleto) {
    const calc = paraCalculo(r);
    const hoje = hojeNoBrasil();
    const fimDoMes = `${competenciaDe(hoje)}-31`;
    const pendentes = pendentesAte(calc, fimDoMes).map((o) => ({
      competencia: o.competencia,
      data: o.data,
      parcela: o.parcela,
      atrasada: o.data < hoje,
    }));
    // Mês atual: pendente, paga ou pulada (null se não acontece neste mês).
    const doMes =
      ocorrenciasEntre(calc, `${competenciaDe(hoje)}-01`, fimDoMes)[0] ?? null;
    const transacaoDoMes = doMes
      ? (r.ocorrencias.find((o) => o.competencia === doMes.competencia)
          ?.transacaoId ?? null)
      : null;
    return {
      id: r.id,
      descricao: r.descricao,
      valor: calc.valor,
      tipoTransacao: r.tipoTransacao,
      inicio: calc.inicio,
      diaDoMes: Number(calc.inicio.slice(8, 10)),
      ehSalario: r.ehSalario,
      ativo: r.ativo,
      parcelasTotal: r.parcelasTotal,
      parcelaInicial: r.parcelaInicial,
      valorAVista: r.valorAVista === null ? null : Number(r.valorAVista),
      conta: r.conta,
      categoria: r.categoria,
      mesAtual: doMes && {
        competencia: doMes.competencia,
        data: doMes.data,
        status: doMes.status,
        parcela: doMes.parcela,
        transacaoId: transacaoDoMes,
      },
      pendentes,
      proxima: (() => {
        const p = proximaPendente(calc, hoje);
        return (
          p && { competencia: p.competencia, data: p.data, parcela: p.parcela }
        );
      })(),
      parcelamento: progressoParcelas(calc),
    };
  }

  async listar(usuarioId: number) {
    const lista = await this.prisma.recorrente.findMany({
      where: { usuarioId },
      include: incluir,
      orderBy: [{ ativo: 'desc' }, { id: 'asc' }],
    });
    return lista.map((r) => this.montar(r));
  }

  async detalhar(id: number, usuarioId: number) {
    return this.montar(await this.buscar(id, usuarioId));
  }

  async criar(dto: CriarRecorrenteDto, usuarioId: number) {
    const regras = {
      tipoTransacao: dto.tipoTransacao,
      ehSalario: dto.ehSalario ?? false,
      parcelasTotal: dto.parcelasTotal ?? null,
      parcelaInicial: dto.parcelaInicial ?? 1,
    };
    this.validarRegras(regras);
    await this.validarVinculos(usuarioId, dto.contaId, dto.categoriaId);

    const criado = await this.prisma.recorrente.create({
      data: {
        ...regras,
        descricao: dto.descricao.trim(),
        valor: dinheiro(dto.valor),
        inicio: inicioDoDia(dto.inicio.slice(0, 10), 'inicio'),
        valorAVista: dinheiroOpcional(dto.valorAVista),
        contaId: dto.contaId,
        categoriaId: dto.categoriaId,
        usuarioId,
      },
      include: incluir,
    });
    return this.montar(criado);
  }

  async atualizar(id: number, dto: AtualizarRecorrenteDto, usuarioId: number) {
    const atual = await this.buscar(id, usuarioId);
    this.validarRegras({
      tipoTransacao: dto.tipoTransacao ?? atual.tipoTransacao,
      ehSalario: dto.ehSalario ?? atual.ehSalario,
      parcelasTotal:
        dto.parcelasTotal !== undefined
          ? dto.parcelasTotal
          : atual.parcelasTotal,
      parcelaInicial: dto.parcelaInicial ?? atual.parcelaInicial,
    });
    await this.validarVinculos(usuarioId, dto.contaId, dto.categoriaId);

    const atualizado = await this.prisma.recorrente.update({
      where: { id: atual.id },
      data: {
        descricao: dto.descricao?.trim(),
        valor: dinheiroOpcional(dto.valor),
        tipoTransacao: dto.tipoTransacao,
        inicio: dto.inicio
          ? inicioDoDia(dto.inicio.slice(0, 10), 'inicio')
          : undefined,
        contaId: dto.contaId,
        categoriaId: dto.categoriaId,
        ehSalario: dto.ehSalario,
        parcelasTotal: dto.parcelasTotal,
        parcelaInicial: dto.parcelaInicial,
        valorAVista: dinheiroOpcional(dto.valorAVista),
        ativo: dto.ativo,
      },
      include: incluir,
    });
    return this.montar(atualizado);
  }

  /** Apaga a conta fixa. As transações já lançadas continuam no extrato. */
  async remover(id: number, usuarioId: number) {
    const r = await this.buscar(id, usuarioId);
    await this.prisma.recorrente.delete({ where: { id: r.id } });
    return { id: r.id };
  }

  private validarCompetencia(r: RecorrenteCompleto, competencia: string) {
    if (!ehCompetenciaValida(paraCalculo(r), competencia))
      throw new BadRequestException('Esse mês não faz parte desta conta fixa');
    if (r.ocorrencias.some((o) => o.competencia === competencia))
      throw new BadRequestException('Esse mês já foi confirmado ou pulado');
  }

  /** Confirma o mês: lança a transação na conta e marca o mês como pago. */
  async pagar(id: number, dto: PagarRecorrenteDto, usuarioId: number) {
    const r = await this.buscar(id, usuarioId);
    this.validarCompetencia(r, dto.competencia);
    const contaId = dto.contaId ?? r.contaId;
    if (!contaId)
      throw new BadRequestException(
        'Escolha a conta de onde saiu (ou entrou) o dinheiro',
      );

    const numero = parcelaNaCompetencia(paraCalculo(r), dto.competencia);
    const parcela = numero === null ? '' : ` (${numero}/${r.parcelasTotal})`;

    await this.prisma.$transaction(async (tx) => {
      const transacao = await this.transacaoService.criar(
        {
          valor: dto.valor ?? Number(Number(r.valor).toFixed(2)),
          descricao: `${r.descricao}${parcela}`,
          tipoTransacao: r.tipoTransacao,
          contaId,
          categoriaId: r.categoriaId ?? undefined,
          data: dto.data?.slice(0, 10) ?? hojeNoBrasil(),
        },
        usuarioId,
        tx,
      );
      await tx.ocorrenciaRecorrente.create({
        data: {
          recorrenteId: r.id,
          competencia: dto.competencia,
          transacaoId: transacao.id,
        },
      });
    });
    return this.detalhar(r.id, usuarioId);
  }

  /** Este mês não vai acontecer (ou foi pago por fora): sai das contas a pagar. */
  async pular(id: number, competencia: string, usuarioId: number) {
    const r = await this.buscar(id, usuarioId);
    this.validarCompetencia(r, competencia);
    await this.prisma.ocorrenciaRecorrente.create({
      data: { recorrenteId: r.id, competencia },
    });
    return this.detalhar(r.id, usuarioId);
  }

  /** Desfaz a confirmação: apaga a transação lançada (devolvendo o saldo) e o mês volta a pendente. */
  async desfazer(id: number, competencia: string, usuarioId: number) {
    const r = await this.buscar(id, usuarioId);
    const ocorrencia = await this.prisma.ocorrenciaRecorrente.findUnique({
      where: { recorrenteId_competencia: { recorrenteId: r.id, competencia } },
    });
    if (!ocorrencia) throw new NotFoundException('Esse mês não foi confirmado');
    if (ocorrencia.transacaoId !== null) {
      // Apagar a transação apaga o mês junto (cascade) e devolve o saldo.
      await this.transacaoService.remover(ocorrencia.transacaoId, usuarioId);
    } else {
      await this.prisma.ocorrenciaRecorrente.delete({
        where: { id: ocorrencia.id },
      });
    }
    return this.detalhar(r.id, usuarioId);
  }
}
