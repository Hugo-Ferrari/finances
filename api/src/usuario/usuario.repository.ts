import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import { createUsuarioDto } from './dto/createUsuario.DTO';
@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: createUsuarioDto) {
    return this.prisma.usuario.create({ data: dados });
  }

  async buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({ where: { id: id } }); // quero o campo id, com o valor id
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
