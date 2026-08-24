import { ContaRepository } from './../conta/conta.repository';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
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
    if(conta.ativa === false) throw new BadRequestException ("Conta está inativa")
    
    if(dto.tipoTransacao === "ENTRADA"){
      let novoSaldo = conta.saldo.add(dto.valor)
      await this.contaRepository.atualizarSaldo(conta.id,novoSaldo,usuarioId)
    }

    else if(dto.tipoTransacao === "SAIDA"){
      if(conta.saldo.lt(dto.valor)){
      throw new BadRequestException("Saldo indisponivel para realizar essa transação")
    }
      let novoSaldo = conta.saldo.sub(dto.valor)
      await this.contaRepository.atualizarSaldo(conta.id, novoSaldo,usuarioId)
    }

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
    const transacao = await this.repository.buscarPorId(id,usuarioId)
    if(!transacao) throw new BadRequestException("transação não encontrada")


      if(dto.valor !== undefined){ 
        const conta = await this.contaRepository.buscarPorId(transacao.contaId, usuarioId)
        if(!conta) throw new BadRequestException("Conta não encontrada")
        if(conta.ativa === false) throw new BadRequestException("Conta está inativa")

      let novoSaldo = conta.saldo
      
      if(transacao.tipoTransacao === "ENTRADA"){
        novoSaldo = novoSaldo.sub(transacao.valor)
      }
      else{
        novoSaldo = novoSaldo.add(transacao.valor)
      }

      if(transacao.tipoTransacao === "ENTRADA"){
        novoSaldo = novoSaldo.add(dto.valor) 
      }
      else{
        if(novoSaldo.lt(dto.valor)){
          throw new BadRequestException("Saldo indisponivel para atualizar essa transação")
        }
        novoSaldo = novoSaldo.sub(dto.valor)
      }
      await this.contaRepository.atualizarSaldo(conta.id, novoSaldo, usuarioId)
      
      }
    return this.repository.atualizar(id, dto, usuarioId);
  }
  async remover(id: number, usuarioId: number) {
    return this.repository.remover(id, usuarioId);
  }
}
