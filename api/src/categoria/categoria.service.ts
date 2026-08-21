
import { Injectable } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repoitory';
import { createCategoriaDto } from './dto/createCategoriaDto';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';

@Injectable()
export class CategoriaService {
  constructor(private readonly repository: CategoriaRepository) {}
  //criar(), listar(),buscarPorId(),atualizar(),remover()

  async criar(dto:createCategoriaDto,usuarioId:number){
    const dados ={...dto,usuarioId}
    const response  = await this.repository.criar( dados) // passar a autentificação 
    return response;
  }

  async listar(usuarioId:number){
    const response = await this.repository.listar(usuarioId)
    return response 
  }
  async buscarPorId(id:number,usuarioId:number){
    const response = await this.repository.buscarPorId(id,usuarioId)
    return response
  }
  async atualizar(id:number, dto:UpdateCategoriaDto,usuarioId:number){
    
    const response = await this.repository.atualizar(id,dto,usuarioId)
    return response
  }
  async deletar(id:number, usuarioId:number){
    const response = await this.repository.delete(id,usuarioId)
    return response
  }
}
