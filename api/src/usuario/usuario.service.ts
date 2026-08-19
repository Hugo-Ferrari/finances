import { response } from 'express';
import { Injectable } from '@nestjs/common';
import { createUsuarioDto } from './dto/createUsuario.DTO';
import { UsuarioRepository } from './usuario.repository';
import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsuarioService {
  constructor(private readonly repository: UsuarioRepository) {}
  //criar(), buscarPorId(),buscarPorEmail(),atualizar(),remover(),alterarSenha()(futuramente)

  async criarUser(dto: createUsuarioDto) {
    const senhaUser = await bcrypt.hash(dto.senha,10)
    dto.senha = senhaUser
    await this.repository.create(dto)
    return 'usuario criado com sucesso'

  }

  async buscarEmail(email: string) {
    const user = await this.repository.buscarPorEmail(email);
    return user;
  }
  async buscarId(id: number) {
    const res = await this.repository.buscarPorId(id);
    return res;
  }

  async atualizar(id: number, dto: UpdateUsuarioDto) {
    const user = await this.repository.atualizar(id, dto);
    return user;
  }
  async deletar(id: number) {
    const user = await this.repository.remover(id);
    return user;
  }
}
