import { ContaRepository } from './../conta/conta.repository';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { TransacaoRepository } from './transacao.repository';
import { createTransacaoDto } from './dto/createTransacaoDto';
import { updateTransacaoDto } from './dto/updateTransacaoDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { dataDaTransacao } from 'src/common/datas';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class TransacaoService {
  constructor(
    private readonly repository: TransacaoRepository,
    private readonly contaRepository: ContaRepository,
    private readonly prisma: PrismaService,
  ) {}
  //criar(), listar(),buscarPorId(), listarPorConta, listarPorCategoria,ListarPorPerido, atualizar(),remover(), obterResumo

  private async validarCategoria(
    categoriaId: number | undefined,
    usuarioId: number,
    tx: Prisma.TransactionClient,
  ) {
    if (categoriaId === undefined) return;

    const categoria = await tx.categoria.findFirst({
      where: { id: categoriaId, usuarioId },
    });
    if (!categoria)
      throw new ForbiddenException(
        'Categoria não encontrada ou não pertence a você',
      );
  }

  /**
   * Cria a transação e ajusta o saldo da conta. Com `tx`, roda dentro da
   * transação de quem chamou (ex.: confirmar uma conta fixa grava a transação
   * e o mês pago juntos).
   */
  async criar(
    dto: createTransacaoDto,
    usuarioId: number,
    txExterna?: Prisma.TransactionClient,
  ) {
    const executar = async (tx: Prisma.TransactionClient) => {
      await this.validarCategoria(dto.categoriaId, usuarioId, tx);

      const conta = await this.contaRepository.buscarPorId(
        dto.contaId,
        usuarioId,
        tx,
      );
      if (!conta)
        throw new ForbiddenException(
          'Conta não encontrada ou não pertence a você',
        );
      if (conta.ativa === false)
        throw new BadRequestException('Conta está inativa');

      const valor = new Decimal(dto.valor);
      const delta = dto.tipoTransacao === 'ENTRADA' ? valor : valor.neg();
      const ok = await this.contaRepository.ajustarSaldo(
        conta.id,
        delta,
        tx,
        true,
      );
      if (!ok) {
        throw new BadRequestException(
          'Saldo indisponivel para realizar essa transação',
        );
      }

      return this.repository.criarTransacao(
        // valor com 2 casas: o número do JS (99.9) chegava ao banco como 99.90000000000001
        {
          ...dto,
          valor: valor.toDecimalPlaces(2),
          data: dataDaTransacao(dto.data),
        },
        tx,
      );
    };
    return txExterna ? executar(txExterna) : this.prisma.$transaction(executar);
  }

  async listar(usuarioid: number) {
    return this.repository.listar(usuarioid);
  }

  async buscarPorId(id: number, usuarioId: number) {
    return this.repository.buscarPorId(id, usuarioId);
  }

  async buscarPorConta(contaId: number, usuarioId: number) {
    return this.repository.listarPorConta(contaId, usuarioId);
  }

  async listarPorCategoria(categoriaId: number, usuarioId: number) {
    return this.repository.listarCategoria(categoriaId, usuarioId);
  }

  async atualizar(dto: updateTransacaoDto, id: number, usuarioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const transacao = await this.repository.buscarPorId(id, usuarioId, tx);
      if (!transacao) throw new BadRequestException('transação não encontrada');

      await this.validarCategoria(dto.categoriaId, usuarioId, tx);

      if (dto.valor !== undefined) {
        const conta = await this.contaRepository.buscarPorId(
          transacao.contaId,
          usuarioId,
          tx,
        );
        if (!conta) throw new BadRequestException('Conta não encontrada');
        if (conta.ativa === false)
          throw new BadRequestException('Conta está inativa');

        // Diferença entre o valor novo e o antigo, com o sinal do tipo.
        const diferenca = new Decimal(dto.valor).sub(transacao.valor);
        const delta =
          transacao.tipoTransacao === 'ENTRADA' ? diferenca : diferenca.neg();
        const ok = await this.contaRepository.ajustarSaldo(
          conta.id,
          delta,
          tx,
          true,
        );
        if (!ok) {
          throw new BadRequestException(
            'Saldo indisponivel para atualizar essa transação',
          );
        }
      }
      return this.repository.atualizar(
        id,
        { ...dto, data: dto.data ? dataDaTransacao(dto.data) : undefined },
        usuarioId,
        tx,
      );
    });
  }
  async remover(id: number, usuarioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const transacaoRemovida = await this.repository.buscarPorId(
        id,
        usuarioId,
        tx,
      );
      if (!transacaoRemovida)
        throw new BadRequestException('Transacao inexistente ');

      const conta = await this.contaRepository.buscarPorId(
        transacaoRemovida.contaId,
        usuarioId,
        tx,
      );

      if (!conta) throw new BadRequestException('Conta inexistente ');
      // Desfaz o efeito da transação no saldo.
      const delta =
        transacaoRemovida.tipoTransacao === 'ENTRADA'
          ? transacaoRemovida.valor.neg()
          : transacaoRemovida.valor;
      await this.contaRepository.ajustarSaldo(conta.id, delta, tx);

      return this.repository.remover(id, usuarioId, tx);
    });
  }

  async listarPorPeriodo(usuarioId: number, inicio: Date, fim: Date) {
    return this.repository.listarPorPeriodo(usuarioId, inicio, fim);
  }

  async obterResumo(usuarioId: number, inicio: Date, fim: Date) {
    return this.repository.obterResumo(usuarioId, inicio, fim);
  }
  async despesaPorCategoria(
    usuarioId: number,
    periodo?: { inicio: Date; fim: Date },
  ) {
    const despesas = await this.repository.despesaPorCategoria(
      usuarioId,
      periodo,
    );
    if (!despesas.length) {
      return [];
    }
    const categoriaIds = despesas
      .map((item) => item.categoriaId)
      .filter((id): id is number => id !== null);
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: categoriaIds }, usuarioId },
      select: { id: true, nome: true },
    });
    const nomePorId = new Map(categorias.map((c) => [c.id, c.nome]));

    const dados = despesas.map((item) => ({
      categoriaId: item.categoriaId,
      valor: item._sum.valor,
      categoria: {
        nome:
          (item.categoriaId !== null && nomePorId.get(item.categoriaId)) ||
          'Sem categoria',
      },
    }));
    return dados;
  }

  async obterResumoTotal(usuarioId: number) {
    return this.repository.obterResumoTotal(usuarioId);
  }
}
