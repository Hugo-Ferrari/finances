import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { createCategoriaDto } from './dto/createCategoriaDto';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';

@Injectable()
export class CategoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dados:createCategoriaDto) {
    return this.prisma.categoria.create({ data: dados });
  }
  async listar() {
    return this.prisma.categoria.findMany();
  }
  async buscarPorId(id: number) {
    return this.prisma.categoria.findUnique({ where: { id: id } });
  }
  async atualizar(id: number, dados: UpdateCategoriaDto) {
    return this.prisma.categoria.update({ where: { id: id }, data: dados });
  }
  async delete(id: number) {
    return this.prisma.categoria.delete({ where: { id: id } });
  }
}
