import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  /** Exclusão da conta pelo próprio usuário (LGPD, art. 18), com a senha. */
  async excluirConta(id: number, senha: string) {
    const usuario = await this.repository.buscarSenha(id);
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado');

    // 403 e não 401: o front trata 401 como sessão expirada e desloga.
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) throw new ForbiddenException('Senha incorreta.');

    await this.repository.removerComDados(id);
    return { mensagem: 'Conta excluída' };
  }
}
