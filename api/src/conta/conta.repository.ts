
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ContaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: Prisma.ContaUncheckedCreateInput ) {
    return this.prisma.conta.create({ data: dados });
  }


  async listar(usuarioId:number) {
    return this.prisma.conta.findMany({where:{usuarioId:usuarioId}});
  }


  async buscarPorId(id: number, usuarioId:number) {
    return this.prisma.conta.findFirst({ where: { id: id, AND:{usuarioId: usuarioId}}});
  }


  async atualizar(id: number, dados: Prisma.ContaUpdateInput, usuarioId:number) {
    const conta = await this.prisma.conta.findFirst({where:{id: id, AND:{usuarioId:usuarioId}}})

    if(!conta) return null

    return this.prisma.conta.update({where:{id:id}, data:dados})
  }


  async remover(id: number, usuarioId:number) {
    return this.prisma.conta.delete({ where: { id: id, AND:{usuarioId:usuarioId}} });
  }
}
