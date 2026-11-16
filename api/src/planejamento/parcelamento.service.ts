import { BadRequestException, Injectable } from '@nestjs/common';
import { hojeNoBrasil } from 'src/common/datas';
import { RecorrenteCalc } from './calendario';
import { simularParcelamento } from './parcelamento';
import { PlanejamentoService } from './planejamento.service';
import { RecorrenteService } from './recorrente.service';
import {
  RegistrarParcelamentoDto,
  SimularParcelamentoDto,
} from './dto/planejamento.dto';

@Injectable()
export class ParcelamentoService {
  constructor(
    private readonly planejamento: PlanejamentoService,
    private readonly recorrentes: RecorrenteService,
  ) {}

  private calcular(dto: SimularParcelamentoDto, rendimentoMensal: number) {
    try {
      return simularParcelamento({
        hoje: hojeNoBrasil(),
        valor: dto.valor,
        parcelas: dto.parcelas,
        valorParcela: dto.valorParcela,
        taxaJuros: dto.taxaJuros,
        descontoAVista: dto.descontoAVista,
        rendimentoMensal,
        primeiraParcela: dto.primeiraParcela.slice(0, 10),
      });
    } catch {
      throw new BadRequestException(
        'Não foi possível calcular esse parcelamento',
      );
    }
  }

  /** Calculadora: não grava nada. Mostra também o impacto no mês e no "pode gastar hoje". */
  async simular(dto: SimularParcelamentoDto, usuarioId: number) {
    const sugerido = await this.planejamento.melhorRendimento(usuarioId);
    const rendimento = dto.rendimentoMensal ?? sugerido?.taxaMensal ?? 0;
    const resultado = this.calcular(dto, rendimento);

    const hoje = hojeNoBrasil();
    const compra: RecorrenteCalc = {
      id: -1,
      descricao: 'Nova compra',
      valor: resultado.parcela,
      tipo: 'SAIDA',
      inicio: resultado.cronograma[0].data,
      parcelasTotal: resultado.parcelas,
      parcelaInicial: 1,
      ehSalario: false,
      ativo: true,
      criadoEm: hoje,
      ocorrencias: [],
    };
    const [antes, depois, comprometimento] = await Promise.all([
      this.planejamento.gastarHoje(usuarioId),
      this.planejamento.gastarHoje(usuarioId, [compra]),
      this.planejamento.comprometimento(usuarioId, compra),
    ]);

    return {
      ...resultado,
      rendimentoSugerido: sugerido,
      impactoHoje: {
        porDiaAntes: antes.porDia,
        porDiaDepois: depois.porDia,
        parcelasNoCiclo: depois.contas.filter((c) => c.recorrenteId === -1)
          .length,
      },
      comprometimento,
    };
  }

  /** Registra a compra: vira uma conta fixa com parcelas. */
  async registrar(dto: RegistrarParcelamentoDto, usuarioId: number) {
    const pagas = dto.parcelasPagas ?? 0;
    if (pagas >= dto.parcelas)
      throw new BadRequestException('Todas as parcelas já foram pagas');
    const r = this.calcular(dto, 0);

    return this.recorrentes.criar(
      {
        descricao: dto.descricao,
        valor: r.parcela,
        tipoTransacao: 'SAIDA',
        // Compra antiga: começa na primeira parcela ainda não paga.
        inicio: r.cronograma[pagas].data,
        parcelasTotal: r.parcelas,
        parcelaInicial: pagas + 1,
        valorAVista: r.precoAVista,
        contaId: dto.contaId,
        categoriaId: dto.categoriaId,
      },
      usuarioId,
    );
  }

  /** Compras parceladas com o andamento (as quitadas vêm por último). */
  async listar(usuarioId: number) {
    const todas = await this.recorrentes.listar(usuarioId);
    const parceladas = todas.filter((r) => r.parcelasTotal !== null);
    parceladas.sort(
      (a, b) =>
        Number(a.parcelamento!.quitada) - Number(b.parcelamento!.quitada) ||
        a.parcelamento!.ultimaParcela.localeCompare(
          b.parcelamento!.ultimaParcela,
        ),
    );
    const comprometimento = await this.planejamento.comprometimento(usuarioId);
    const abertas = parceladas.filter(
      (p) => !p.parcelamento!.quitada && p.ativo,
    );
    return {
      compras: parceladas,
      totalRestante:
        Math.round(
          abertas.reduce((t, p) => t + p.parcelamento!.valorRestante, 0) * 100,
        ) / 100,
      porMes: Math.round(abertas.reduce((t, p) => t + p.valor, 0) * 100) / 100,
      comprometimento,
    };
  }

  /** Para a calculadora já vir com o rendimento da melhor caixinha. */
  async rendimentoSugerido(usuarioId: number) {
    return this.planejamento.melhorRendimento(usuarioId);
  }
}
