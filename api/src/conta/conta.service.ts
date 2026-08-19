import { Injectable } from '@nestjs/common';
import { ContaRepository } from './conta.repository';
import { ContaDto } from './dto/createConta.dto';
import { UpdateContaDto } from './dto/updateConta.dto';

@Injectable()
export class ContaService {
  constructor(private readonly repository: ContaRepository) {}
  //criar(), listar(),buscarPorId(),atualizar(),remover()

  async criar(dto:ContaDto){
    const response = await this.repository.create(dto) //usuario tem que 
  }
  async listar(){
    return this.repository.listar()
  }
  async atualizar(id: number, dto: UpdateContaDto){
    const response = await this.repository.atualizar(id,dto)
    return response
  }

  async buscarPorId(id:number){
    const response = await this.repository.buscarPorId(id)
    return response;
  }
  async deletar(id:number){
    const response = await this.repository.remover(id)
    return response;
  }
}
