
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { UpdateContaDto } from './dto/updateConta.dto';
@Injectable()
export class ContaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: Prisma.ContaUncheckedCreateInput ) {
    return this.prisma.conta.create({ data: dados });
  }


  async listar(usuarioId:number) {
    
    return this.prisma.conta.findMany({where:{usuarioId:usuarioId}});
  }


  async buscarPorId(id: number, usuarioId:number,tx?: Prisma.TransactionClient) {
    const prisma = tx?? this.prisma
    return prisma.conta.findFirst({ where: { id: id, AND:{usuarioId: usuarioId}}});
  }


  async atualizar(id: number, dados: UpdateContaDto, usuarioId:number,tx?: Prisma.TransactionClient) {
    const prisma = tx?? this.prisma
    const conta = await prisma.conta.findFirst({where:{id: id, AND:{usuarioId:usuarioId}}})

    if(!conta) return null

    return prisma.conta.update({where:{id:id}, data:dados})
  }


  async remover(id: number, usuarioId:number,) {
    
    return this.prisma.conta.deleteMany({ where: { id: id, AND:{usuarioId:usuarioId}} });
  }

  async atualizarSaldo(id: number, novoSaldo:Decimal,usuarioId:number,tx?: Prisma.TransactionClient){
    const prisma = tx?? this.prisma
    const conta  = await prisma.conta.findFirst({where:{id:id, AND:{usuarioId:usuarioId}}})
    if(!conta) return null
    return prisma.conta.update({where: {id: id},data: { saldo: novoSaldo}})
  }
}
