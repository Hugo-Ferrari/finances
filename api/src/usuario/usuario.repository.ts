



import { Injectable } from '@nestjs/common';

import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: Prisma.UsuarioCreateInput) {
    return this.prisma.usuario.create({ data: dados });
  }

  async buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({ where: { id: id } }); 
  }
  async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email: email } });
  }

  async atualizar(id: number, dados: UpdateUsuarioDto) {
    return await this.prisma.usuario.update({ where: { id: id }, data: dados }); 
  }
  async remover(id: number) {
    return this.prisma.usuario.delete({ where: { id: id } });
  }
}
