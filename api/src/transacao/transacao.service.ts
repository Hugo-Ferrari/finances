import { ContaRepository } from './../conta/conta.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { TransacaoRepository } from './transacao.repository';
import { createTransacaoDto } from './dto/createTransacaoDto';
import { updateTransacaoDto } from './dto/updateTransacaoDto';

@Injectable()
export class TransacaoService {
  constructor(private readonly repository: TransacaoRepository, 
          private readonly contaRepository:ContaRepository
  ) {}
  //criar(), listar(),buscarPorId(), listarPorConta, listarPorCategoria,ListarPorPerido, atualizar(),remover(), obterResumo
  async criar(dto: createTransacaoDto, usuarioId: number) {
    const conta = await this.contaRepository.buscarPorId(dto.contaId, usuarioId);
    if (!conta) throw new ForbiddenException('Conta não encontrada ou não pertence a você');

    return this.repository.criarTransacao(dto);
  }

  async listar(usuarioid: number) {
    return this.repository.listar(usuarioid);
  }

  async buscarPorId(id: number, usuarioId:number) {
    return this.repository.buscarPorId(id, usuarioId);
  }

  async buscarPorConta(contaId: number, usuarioId:number) {
    return this.repository.listarPorConta(contaId, usuarioId);
  }

  async listarPorCategoria(categoriaId: number, usuarioId: number) {
    return this.repository.listarCategoria(categoriaId, usuarioId);
  }

  async atualizar(dto: updateTransacaoDto, id: number, usuarioId: number) {
    return this.repository.atualizar(id, dto, usuarioId);
  }
  async remover(id: number, usuarioId: number) {
    return this.repository.remover(id, usuarioId);
  }
}
