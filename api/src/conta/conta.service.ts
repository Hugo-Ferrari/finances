import { BadRequestException, Injectable } from '@nestjs/common';
import { ContaRepository } from './conta.repository';
import { UpdateContaDto } from './dto/updateConta.dto';
import { createContaDto } from './dto/createConta.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContaService {
  constructor(private readonly repository: ContaRepository) {}
  //criar(), listar(),buscarPorId(),atualizar(),remover()

  async criar(dto: createContaDto, usuarioId: number) {
    const dados = { ...dto, usuarioId };
    return await this.repository.create(dados);
  }

  async listar(usuarioId: number) {
    return this.repository.listar(usuarioId);
  }

  async atualizar(id: number, dto: UpdateContaDto, usuarioId: number) {
    const response = await this.repository.atualizar(id, dto, usuarioId);
    return response;
  }

  async buscarPorId(id: number, usuarioId: number) {
    const response = await this.repository.buscarPorId(id, usuarioId);
    return response;
  }

  async deletar(id: number, usuarioId: number) {
    const response = await this.repository.remover(id, usuarioId);
    if (response.count === 0)
      throw new BadRequestException('Conta não encontrada');
    return { mensagem: 'Conta removida com sucesso' };
  }
}
