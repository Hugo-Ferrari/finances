import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateContaDto } from './dto/updateConta.dto';
import { createContaDto } from './dto/createConta.dto';

export class ContaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: createContaDto) {
    return this.prisma.conta.create({ data: dados });
  }
  async listar() {
    return this.prisma.conta.findMany();
  }
  async buscarPorId(id: number) {
    return this.prisma.conta.findUnique({ where: { id: id } });
  }
  async atualizar(id: number, dados: UpdateContaDto) {
    return this.prisma.conta.update({ where: { id: id }, data: dados });
  }
  async remover(id: number) {
    return this.prisma.conta.delete({ where: { id: id } });
  }
}
