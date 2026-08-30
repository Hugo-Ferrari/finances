import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repoitory';
import { createCategoriaDto } from './dto/createCategoriaDto';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';

@Injectable()
export class CategoriaService {
  constructor(private readonly repository: CategoriaRepository) {}
  private normalizarNome(nome: string) {
  return nome
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

  async criar(dto: createCategoriaDto, usuarioId: number) {
    const nome = this.normalizarNome(dto.nome)
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
 const dados: UpdateCategoriaDto = {...dto,nome: dto.nome ? this.normalizarNome(dto.nome) : undefined,};
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
