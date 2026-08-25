import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { updateTransacaoDto } from './dto/updateTransacaoDto';

@Injectable()
export class TransacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criarTransacao(dados: Prisma.TransacaoUncheckedCreateInput,tx?: Prisma.TransactionClient) {
    const prisma = tx?? this.prisma
    return prisma.transacao.create({ data: dados });
  }

  async buscarPorId(id: number, usuarioId: number,tx?: Prisma.TransactionClient) {
     const prisma = tx?? this.prisma
    return prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
  }

  async atualizar(id: number, dados: updateTransacaoDto, usuarioId: number,tx?: Prisma.TransactionClient) {
     const prisma = tx?? this.prisma
    const transacao = await prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
    if (!transacao) return null;
    return prisma.transacao.update({ where: { id }, data: dados });
  }

  async remover(id: number, usuarioId: number,tx?: Prisma.TransactionClient) {
     const prisma = tx?? this.prisma
    const transacao = await prisma.transacao.findFirst({
      where: { id, conta: { usuarioId } }
    });
    if (!transacao) return null;
    return prisma.transacao.delete({ where: { id } });
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