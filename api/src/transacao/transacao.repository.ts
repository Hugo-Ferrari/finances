import { Prisma } from 'src/generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criarTransacao(dados: Prisma.TransacaoCreateInput) {
    return this.prisma.transacao.create({ data: dados });
  }
  async buscarPorId(id: number) {
    return this.prisma.transacao.findUnique({ where: { id: id } });
  }
  async atualizar(id: number, dados: Prisma.TransacaoUpdateInput) {
    return this.prisma.transacao.update({ where: { id: id }, data: dados });
  }
  async remover(id: number) {
    return this.prisma.transacao.delete({ where: { id: id } });
  }
  async listar() {
    return this.prisma.transacao.findMany();
  }
  async listarCategoria(categoriaId: number) {
    return this.prisma.transacao.findMany({
      where: { categoriaId: categoriaId },
    });
  }
  async listarPorConta(contaId: number) {
    return await this.prisma.transacao.findMany({
      where: { contaId: contaId },
    });
  }
}
