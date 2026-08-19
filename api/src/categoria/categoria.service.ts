import { Injectable } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repoitory';
import { createCategoriaDto } from './dto/createCategoriaDto';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';
import { response } from 'express';

@Injectable()
export class CategoriaService {
  constructor(private readonly repository: CategoriaRepository) {}
  //criar(), listar(),buscarPorId(),atualizar(),remover()

  async criar(id:number, dto:createCategoriaDto){
    const response  = await this.repository.criar(id, dto) // passar a autentificação 
    return response;
  }

  async listar(){
    const response = await this.repository.listar()
    return response 
  }
  async buscarPorId(id:number){
    const response = await this.repository.buscarPorId(id)
    return response
  }
  async atualizar(id:number, dto:UpdateCategoriaDto){
    const response = await this.repository.atualizar(id,dto)
  }
  async deletar(id:number){
    const response = await this.repository.delete(id)
    return response
  }
}
