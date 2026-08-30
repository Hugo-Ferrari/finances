import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { updateTransacaoDto } from './dto/updateTransacaoDto';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class TransacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criarTransacao(
    dados: Prisma.TransacaoUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx ?? this.prisma;
    return prisma.transacao.create({ data: dados });
  }

  async buscarPorId(
    id: number,
    usuarioId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx ?? this.prisma;
    return prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } },
    });
  }

  async atualizar(
    id: number,
    dados: updateTransacaoDto,
    usuarioId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx ?? this.prisma;
    const transacao = await prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } },
    });
    if (!transacao) return null;
    return prisma.transacao.update({ where: { id }, data: dados });
  }

  async remover(id: number, usuarioId: number, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    const transacao = await prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } },
    });
    if (!transacao) return null;
    return prisma.transacao.delete({ where: { id } });
  }

  async listar(usuarioId: number) {
  return this.prisma.transacao.findMany({
    where: { conta: { usuarioId } },
    include: {
      categoria: true,
    },
  });
}
  async listarCategoria(categoriaId: number, usuarioId: number) {
    return this.prisma.transacao.findMany({
      where: { categoriaId, conta: { usuarioId } },
    });
  }

  async listarPorConta(contaId: number, usuarioId: number) {
    return this.prisma.transacao.findMany({
      where: { contaId, conta: { usuarioId } },
    });
  }

  async listarPorPeriodo(usuarioId: number, inicio: Date, fim: Date) {
    return this.prisma.transacao.findMany({
      where: { conta: { usuarioId }, data: { gte: inicio, lte: fim } },
    });
  }
  async obterResumo(usuarioId: number, inicio: Date, fim: Date) {
    const entradas = await this.prisma.transacao.aggregate({
      _sum: { valor: true },
      where: {
        conta: { usuarioId },
        tipoTransacao: 'ENTRADA',
        data: { gte: inicio, lte: fim },
      },
    });
    const saidas = await this.prisma.transacao.aggregate({
      _sum: { valor: true },
      where: {
        conta: { usuarioId },
        tipoTransacao: 'SAIDA',
        data: { gte: inicio, lte: fim },
      },
    });
    const totalEntradas = entradas._sum.valor ?? new Decimal(0);
    const totalSaidas = saidas._sum.valor ?? new Decimal(0);
    const saldoPeriodo = totalEntradas.sub(totalSaidas);

    return { totalEntradas, totalSaidas, saldoPeriodo };
  }

  async despesaPorCategoria(usuarioId: number) {
    return this.prisma.transacao.groupBy({
      by: ['categoriaId'],
      where: { tipoTransacao: 'SAIDA', conta: { usuarioId } },
      _sum: { valor: true },
    });
  }
  async obterResumoTotal(usuarioId: number) {
    const entradas = await this.prisma.transacao.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        conta: {
          usuarioId,
        },
        tipoTransacao: 'ENTRADA',
      },
    });

    const saidas = await this.prisma.transacao.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        conta: {
          usuarioId,
        },
        tipoTransacao: 'SAIDA',
      },
    });

    const totalEntradas = entradas._sum.valor ?? new Decimal(0);
    const totalSaidas = saidas._sum.valor ?? new Decimal(0);

    return {
      totalEntradas,
      totalSaidas,
    };
  }
}
