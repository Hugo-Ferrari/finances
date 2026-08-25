import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repoitory';
import { createCategoriaDto } from './dto/createCategoriaDto';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';

@Injectable()
export class CategoriaService {
  constructor(private readonly repository: CategoriaRepository) {}
  

  async criar(dto: createCategoriaDto, usuarioId: number) {
    const nome = dto.nome.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const dados = { ...dto, nome, usuarioId };
    const response = await this.repository.criar(dados);
    return response;
  }

  async listar(usuarioId: number) {
    return await this.repository.listar(usuarioId);
  }
  async buscarPorId(id: number, usuarioId: number) {
    const response = await this.repository.buscarPorId(id, usuarioId);
    if (!response) throw new NotFoundException('Categoria não encontrada');

    return response;
  }
  async atualizar(id: number, dto: UpdateCategoriaDto, usuarioId: number) {
    const nome = dto.nome?.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const dados = { ...dto, nome, usuarioId };
    const response = await this.repository.atualizar(id, dados, usuarioId);

    if (!response) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return response;
  }


  async deletar(id: number, usuarioId: number) {
    const response = await this.repository.delete(id, usuarioId);
    if (!response) throw new NotFoundException('Categoria não encontrada');
    return {
      mensagem: 'Categoria deletada com sucesso',
    };
  }
}
