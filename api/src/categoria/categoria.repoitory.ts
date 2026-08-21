import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';
import { Prisma } from 'src/generated/prisma/client.ts/client';

@Injectable()
export class CategoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dados: Prisma.CategoriaUncheckedCreateInput) {
    return this.prisma.categoria.create({ data: dados });
  }
  async listar(usuarioId: number) {
    return this.prisma.categoria.findMany({ where: { usuarioId: usuarioId } });
  }
  async buscarPorId(id: number, usuarioId: number) {
    return this.prisma.categoria.findFirst({
      where: { id: id, AND: { usuarioId: usuarioId } },
    });
  }
  async atualizar(id: number, dados: UpdateCategoriaDto, usuarioId: number) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: id, AND: { usuarioId: usuarioId } },
    });

    if (!categoria) return null;
    return this.prisma.categoria.update({ where: { id: id }, data: dados });
  }
  async delete(id: number, usuarioId: number) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: id, AND: { usuarioId: usuarioId } },
    });

    if (!categoria) return null;

    return this.prisma.categoria.delete({ where: { id: id } });
  }
}
