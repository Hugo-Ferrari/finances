import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Bloqueia nomes repetidos ignorando acento e maiúscula ("Saúde" = "saude"). */
  private async garantirNomeUnico(
    nome: string,
    usuarioId: number,
    ignorarId?: number,
  ) {
    const chave = this.normalizarNome(nome);
    const categorias = await this.repository.listar(usuarioId);
    const repetida = categorias.some(
      (c) => c.id !== ignorarId && this.normalizarNome(c.nome) === chave,
    );
    if (repetida) {
      throw new ConflictException('Você já tem uma categoria com esse nome.');
    }
  }

  async criar(dto: createCategoriaDto, usuarioId: number) {
    // Guarda o nome como o usuário digitou (com acentos).
    const nome = dto.nome.trim();
    await this.garantirNomeUnico(nome, usuarioId);
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
    const nome = dto.nome?.trim();
    if (nome) await this.garantirNomeUnico(nome, usuarioId, id);
    const dados: UpdateCategoriaDto = { ...dto, nome: nome || undefined };
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
