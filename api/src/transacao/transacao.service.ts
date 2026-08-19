import { Injectable } from '@nestjs/common';
import { TransacaoRepository } from './transacao.repository';

@Injectable()
export class TransacaoService {
  constructor(private readonly repository: TransacaoRepository) {}
  //criar(), listar(),buscarPorId(), listarPorConta, listarPorCategoria,ListarPorPerido, atualizar(),remover(), obterResumo
}
