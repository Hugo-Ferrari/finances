import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criarTransacao(dados: Prisma.TransacaoUncheckedCreateInput) {
    return this.prisma.transacao.create({ data: dados });
  }

  async buscarPorId(id: number, usuarioId: number) {
    return this.prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
  }

  async atualizar(id: number, dados: Prisma.TransacaoUpdateInput, usuarioId: number) {
    const transacao = await this.prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
    if (!transacao) return null;
    return this.prisma.transacao.update({ where: { id }, data: dados });
  }

  async remover(id: number, usuarioId: number) {
    const transacao = await this.prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
    if (!transacao) return null;
    return this.prisma.transacao.delete({ where: { id } });
  }

  async listar(usuarioId: number) {
    return this.prisma.transacao.findMany({
      where: { conta: { usuarioId } }
    });
  }

  async listarCategoria(categoriaId: number, usuarioId: number) {
    return this.prisma.transacao.findMany({
      where: { categoriaId, conta: { usuarioId } }
    });
  }

  async listarPorConta(contaId: number, usuarioId: number) {
    return this.prisma.transacao.findMany({
      where: { contaId, conta: { usuarioId } }
    });
  }
}