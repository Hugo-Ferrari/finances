import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrcamento, UpdateOrcamento } from './dto/orcamentoDto';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class OrcamentoRespository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dados: CreateOrcamento, usuarioId: number) {
    return this.prisma.orcamento.create({
      data: { valor: dados.valor, usuarioId, categoriaId: dados.categoriaId },
    });
  }

  async listar(usuarioId: number) {
    return this.prisma.orcamento.findMany({ where: { usuarioId: usuarioId } });
  }

  async atualizar(dados: UpdateOrcamento, usuarioId: number, id: number) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id, usuarioId: usuarioId },
    });
    if (!orcamento) throw new BadRequestException('Usuario não encontrado');
    return this.prisma.orcamento.update({ where: { id }, data: dados });
  }
  async delete(id: number, usuarioId: number) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id, usuarioId },
    });
    if (!orcamento) throw new BadRequestException('Orçamento não encontrado');
    return this.prisma.orcamento.delete({ where: { id } });
  }
}
