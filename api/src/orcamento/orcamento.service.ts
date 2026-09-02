import { CategoriaRepository } from './../categoria/categoria.repoitory';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OrcamentoRespository } from './orcamento.respository';
import { CreateOrcamento, UpdateOrcamento } from './dto/orcamentoDto';
import { UsuarioRepository } from 'src/usuario/usuario.repository';

@Injectable()
export class OrcamentoService {
  constructor(
    private readonly repository: OrcamentoRespository,
    private readonly usuarioRespository: UsuarioRepository,
    private readonly CategoriaRepository: CategoriaRepository,
  ) {}

  async criar(dados: CreateOrcamento, usuarioId: number) {
    const user = await this.usuarioRespository.buscarPorId(usuarioId);
    if (!user) throw new BadRequestException('Usuario não encontrado');
    const categoria = await this.CategoriaRepository.buscarPorId(
      dados.categoriaId,
      usuarioId,
    );
    if (!categoria) throw new BadRequestException('categoria não encontrada');
    return this.repository.criar(dados, usuarioId);
  }

  async listar(usuarioId: number) {
    return this.repository.listar(usuarioId);
  }

  async atualizar(
    usuarioId: number,
    dados: UpdateOrcamento,
    id: number,
    categoriaId: number,
  ) {
    const user = await this.usuarioRespository.buscarPorId(usuarioId);
    if (!user) throw new BadRequestException('Usuario não encontrado');
    const categoria = await this.CategoriaRepository.buscarPorId(
      categoriaId,
      usuarioId,
    );
    if (!categoria) throw new BadRequestException('Categoria não encontrado');
    return this.repository.atualizar(dados, id, usuarioId);
  }

  async delete(usuarioId: number, id: number) {

    return this.repository.delete(id, usuarioId);
  }
}
