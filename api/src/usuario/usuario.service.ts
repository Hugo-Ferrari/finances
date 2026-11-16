import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createUsuarioDto } from './dto/createUsuario.DTO';
import { UsuarioRepository } from './usuario.repository';
import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private readonly repository: UsuarioRepository) {}
  //criar(), buscarPorId(),buscarPorEmail(),atualizar(),remover(),alterarSenha()(futuramente)

  async criarUser(dto: createUsuarioDto) {
    const senhaUser = await bcrypt.hash(dto.senha, 10);
    const dados = { ...dto, senha: senhaUser };
    await this.repository.create(dados);
    return 'usuario criado com sucesso';
  }

  async buscarEmail(email: string) {
    const user = await this.repository.buscarPorEmail(email);
    return user;
  }
  async buscarId(usuarioId: number) {
    const res = await this.repository.buscarPorId(usuarioId);
    // O login não consulta mais o banco a cada requisição: se a conta foi
    // apagada, é aqui (ao abrir o app) que a sessão deixa de valer.
    if (!res) throw new UnauthorizedException('Usuário não encontrado');
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
