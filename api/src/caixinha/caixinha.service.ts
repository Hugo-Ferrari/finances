import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { Prisma } from 'src/generated/prisma/client.ts/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContaRepository } from 'src/conta/conta.repository';
import { hojeNoBrasil, inicioDoDia } from 'src/common/datas';
import {
  calcularEstado,
  Movimento,
  prever,
  rendimentosMensais,
  resumir,
  SaldoInsuficienteError,
  Taxa,
} from './rendimento';
import {
  AtualizarCaixinhaDto,
  CriarCaixinhaDto,
  NovaTaxaDto,
  NovoMovimentoDto,
  PrevisaoQueryDto,
  TipoMovimentoDto,
} from './dto/caixinha.dto';

const incluir = {
  taxas: { orderBy: { inicio: 'asc' } },
  movimentos: {
    orderBy: [{ data: 'asc' }, { id: 'asc' }],
    include: { conta: { select: { id: true, nome: true } } },
  },
} satisfies Prisma.CaixinhaInclude;

type CaixinhaCompleta = Prisma.CaixinhaGetPayload<{ include: typeof incluir }>;

const dia = (d: Date) => d.toISOString().slice(0, 10);

function paraCalculo(c: CaixinhaCompleta): {
  taxas: Taxa[];
  movimentos: Movimento[];
} {
  return {
    taxas: c.taxas.map((t) => ({
      taxa: Number(t.taxa),
      periodo: t.periodo,
      inicio: dia(t.inicio),
    })),
    movimentos: c.movimentos.map((m) => ({
      tipo: m.tipo,
      valor: Number(m.valor),
      data: dia(m.data),
    })),
  };
}

@Injectable()
export class CaixinhaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contaRepository: ContaRepository,
  ) {}

  /** Dia informado (ou hoje), sem permitir datas futuras. */
  private diaValido(data: string | undefined, campo: string): string {
    const hoje = hojeNoBrasil();
    const valor = data ? data.slice(0, 10) : hoje;
    inicioDoDia(valor, campo); // valida o formato
    if (valor > hoje)
      throw new BadRequestException(`${campo} não pode ser no futuro`);
    return valor;
  }

  private async buscar(
    id: number,
    usuarioId: number,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const caixinha = await tx.caixinha.findFirst({
      where: { id, usuarioId },
      include: incluir,
    });
    if (!caixinha) throw new NotFoundException('Caixinha não encontrada');
    return caixinha;
  }

  /** Garante que o histórico continua possível (nenhuma retirada maior que o saldo). */
  private validarHistorico(c: CaixinhaCompleta) {
    const { taxas, movimentos } = paraCalculo(c);
    try {
      calcularEstado(taxas, movimentos, hojeNoBrasil());
    } catch (error) {
      if (error instanceof SaldoInsuficienteError) {
        throw new BadRequestException(
          'Saldo insuficiente na caixinha para essa retirada.',
        );
      }
      throw error;
    }
  }

  /** Tira (delta < 0) ou devolve (delta > 0) dinheiro de uma conta do usuário. */
  private async movimentarConta(
    contaId: number,
    delta: number,
    usuarioId: number,
    tx: Prisma.TransactionClient,
  ) {
    const conta = await this.contaRepository.buscarPorId(
      contaId,
      usuarioId,
      tx,
    );
    if (!conta)
      throw new ForbiddenException(
        'Conta não encontrada ou não pertence a você',
      );
    if (!conta.ativa) throw new BadRequestException('Conta está inativa');
    const ok = await this.contaRepository.ajustarSaldo(
      conta.id,
      new Decimal(delta),
      tx,
      true,
    );
    if (!ok)
      throw new BadRequestException(
        `Saldo insuficiente na conta ${conta.nome}.`,
      );
  }

  private montar(c: CaixinhaCompleta, detalhes: boolean) {
    const hoje = hojeNoBrasil();
    const { taxas, movimentos } = paraCalculo(c);
    const resumo = resumir(taxas, movimentos, hoje, c.isentaIR);
    const base = {
      id: c.id,
      nome: c.nome,
      instituicao: c.instituicao,
      isentaIR: c.isentaIR,
      criadaEm: c.criadaEm,
      ...resumo,
    };
    if (!detalhes) return base;
    return {
      ...base,
      taxas: taxas.map((t, i) => ({ id: c.taxas[i].id, ...t })),
      movimentos: c.movimentos.map((m) => ({
        id: m.id,
        tipo: m.tipo,
        valor: Number(m.valor),
        data: dia(m.data),
        conta: m.conta,
      })),
      rendimentosMensais: rendimentosMensais(taxas, movimentos, hoje),
    };
  }

  async listar(usuarioId: number) {
    const caixinhas = await this.prisma.caixinha.findMany({
      where: { usuarioId },
      include: incluir,
      orderBy: { criadaEm: 'asc' },
    });
    return caixinhas.map((c) => this.montar(c, false));
  }

  async detalhar(id: number, usuarioId: number) {
    return this.montar(await this.buscar(id, usuarioId), true);
  }

  async criar(dto: CriarCaixinhaDto, usuarioId: number) {
    const data = this.diaValido(dto.dataInicial, 'dataInicial');
    const criada = await this.prisma.$transaction(async (tx) => {
      if (dto.contaOrigemId !== undefined) {
        await this.movimentarConta(
          dto.contaOrigemId,
          -dto.valorInicial,
          usuarioId,
          tx,
        );
      }
      return tx.caixinha.create({
        data: {
          nome: dto.nome.trim(),
          instituicao: dto.instituicao?.trim() || null,
          isentaIR: dto.isentaIR ?? false,
          usuarioId,
          taxas: {
            create: {
              taxa: dto.taxa,
              periodo: dto.periodo,
              inicio: inicioDoDia(data),
            },
          },
          movimentos: {
            create: {
              tipo: 'DEPOSITO',
              valor: dto.valorInicial,
              data: inicioDoDia(data),
              contaId: dto.contaOrigemId ?? null,
            },
          },
        },
      });
    });
    return this.detalhar(criada.id, usuarioId);
  }

  async atualizar(id: number, dto: AtualizarCaixinhaDto, usuarioId: number) {
    await this.buscar(id, usuarioId);
    await this.prisma.caixinha.update({
      where: { id },
      data: {
        nome: dto.nome?.trim(),
        instituicao:
          dto.instituicao === undefined
            ? undefined
            : dto.instituicao.trim() || null,
        isentaIR: dto.isentaIR,
      },
    });
    return this.detalhar(id, usuarioId);
  }

  async novaTaxa(id: number, dto: NovaTaxaDto, usuarioId: number) {
    const caixinha = await this.buscar(id, usuarioId);
    const inicio = this.diaValido(dto.inicio, 'inicio');
    const primeiraData = caixinha.taxas.length
      ? dia(caixinha.taxas[0].inicio)
      : inicio;
    if (inicio < primeiraData) {
      throw new BadRequestException(
        'A nova taxa não pode começar antes da criação da caixinha.',
      );
    }
    // Uma taxa por dia: se já existe uma começando no mesmo dia, substitui.
    await this.prisma.$transaction([
      this.prisma.taxaCaixinha.deleteMany({
        where: { caixinhaId: id, inicio: inicioDoDia(inicio) },
      }),
      this.prisma.taxaCaixinha.create({
        data: {
          caixinhaId: id,
          taxa: dto.taxa,
          periodo: dto.periodo,
          inicio: inicioDoDia(inicio),
        },
      }),
    ]);
    return this.detalhar(id, usuarioId);
  }

  async novoMovimento(id: number, dto: NovoMovimentoDto, usuarioId: number) {
    const data = this.diaValido(dto.data, 'data');
    if (dto.tipo !== TipoMovimentoDto.AJUSTE && dto.valor <= 0) {
      throw new BadRequestException('Informe um valor maior que zero.');
    }
    if (dto.tipo === TipoMovimentoDto.AJUSTE && dto.contaId !== undefined) {
      throw new BadRequestException('Atualizar saldo não movimenta contas.');
    }

    await this.prisma.$transaction(async (tx) => {
      const caixinha = await this.buscar(id, usuarioId, tx);
      if (data < dia(caixinha.taxas[0].inicio)) {
        throw new BadRequestException(
          'A data não pode ser anterior à criação da caixinha.',
        );
      }
      const novo = await tx.movimentoCaixinha.create({
        data: {
          caixinhaId: id,
          tipo: dto.tipo,
          valor: dto.valor,
          data: inicioDoDia(data),
          contaId: dto.contaId ?? null,
        },
      });
      this.validarHistorico(await this.buscar(id, usuarioId, tx));
      if (dto.contaId !== undefined) {
        const delta =
          dto.tipo === TipoMovimentoDto.DEPOSITO ? -dto.valor : dto.valor;
        await this.movimentarConta(dto.contaId, delta, usuarioId, tx);
      }
      return novo;
    });
    return this.detalhar(id, usuarioId);
  }

  async removerMovimento(id: number, movimentoId: number, usuarioId: number) {
    await this.prisma.$transaction(async (tx) => {
      const caixinha = await this.buscar(id, usuarioId, tx);
      const movimento = caixinha.movimentos.find((m) => m.id === movimentoId);
      if (!movimento) throw new NotFoundException('Movimento não encontrado');
      if (caixinha.movimentos.length === 1) {
        throw new BadRequestException(
          'Este é o único movimento. Exclua a caixinha, se quiser.',
        );
      }
      // Uma atualização de saldo "fecha" o que veio antes (é o saldo real do banco).
      const travado = caixinha.movimentos.some(
        (m) =>
          m.tipo === 'AJUSTE' &&
          m.id !== movimento.id &&
          (m.data > movimento.data ||
            (m.data.getTime() === movimento.data.getTime() &&
              m.id > movimento.id)),
      );
      if (travado) {
        throw new BadRequestException(
          'Este movimento é anterior a uma atualização de saldo. Desfaça a atualização primeiro.',
        );
      }
      await tx.movimentoCaixinha.delete({ where: { id: movimentoId } });
      this.validarHistorico(await this.buscar(id, usuarioId, tx));
      // Desfaz o efeito na conta vinculada (se ela ainda existir).
      if (movimento.contaId !== null && movimento.tipo !== 'AJUSTE') {
        const valor = Number(movimento.valor);
        const delta = movimento.tipo === 'DEPOSITO' ? valor : -valor;
        await this.movimentarConta(movimento.contaId, delta, usuarioId, tx);
      }
    });
    return this.detalhar(id, usuarioId);
  }

  async remover(id: number, usuarioId: number) {
    await this.buscar(id, usuarioId);
    await this.prisma.caixinha.delete({ where: { id } });
    return { mensagem: 'Caixinha excluída' };
  }

  async previsao(id: number, query: PrevisaoQueryDto, usuarioId: number) {
    const caixinha = await this.buscar(id, usuarioId);
    const { taxas, movimentos } = paraCalculo(caixinha);
    return prever(
      taxas,
      movimentos,
      hojeNoBrasil(),
      query.meses,
      query.aporteMensal,
      caixinha.isentaIR,
    );
  }
}
