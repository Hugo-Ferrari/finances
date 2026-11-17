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

  async buscarPorId(usuarioId: number) {
    return this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, email: true, nome: true },
    });
  }
  async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email: email } });
  }

  async atualizar(id: number, dados: UpdateUsuarioDto) {
    return await this.prisma.usuario.update({
      where: { id: id },
      data: dados,
      select: { id: true, email: true, nome: true },
    });
  }
  async buscarSenha(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { senha: true },
    });
  }

  /**
   * Apaga o usuário e tudo o que é dele. As transações vão primeiro porque a
   * ligação transação → conta não apaga em cascata (de propósito: excluir uma
   * conta com transações continua bloqueado). O resto sai pelo Cascade.
   */
  async removerComDados(id: number) {
    await this.prisma.$transaction([
      this.prisma.transacao.deleteMany({ where: { conta: { usuarioId: id } } }),
      this.prisma.usuario.delete({ where: { id } }),
    ]);
  }
}
