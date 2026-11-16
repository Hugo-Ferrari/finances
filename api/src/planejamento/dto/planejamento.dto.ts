import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TipoTransacao } from 'src/generated/prisma/client.ts/enums';

const COMPETENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CriarRecorrenteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  descricao!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor!: number;

  @IsEnum(TipoTransacao)
  tipoTransacao!: TipoTransacao;

  /** Primeira ocorrência (AAAA-MM-DD). O dia dela vale para todos os meses. */
  @IsDateString()
  inicio!: string;

  @IsOptional()
  @IsInt()
  contaId?: number;

  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsBoolean()
  ehSalario?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  parcelasTotal?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  parcelaInicial?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valorAVista?: number;
}

export class AtualizarRecorrenteDto extends PartialType(CriarRecorrenteDto) {
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class PagarRecorrenteDto {
  @Matches(COMPETENCIA, {
    message: 'competencia deve estar no formato AAAA-MM',
  })
  competencia!: string;

  /** Valor real deste mês (padrão: o valor cadastrado). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor?: number;

  /** Dia do pagamento (padrão: hoje). */
  @IsOptional()
  @IsDateString()
  data?: string;

  /** Conta usada (padrão: a conta cadastrada no recorrente). */
  @IsOptional()
  @IsInt()
  contaId?: number;
}

export class PularRecorrenteDto {
  @Matches(COMPETENCIA, {
    message: 'competencia deve estar no formato AAAA-MM',
  })
  competencia!: string;
}

export class SimularParcelamentoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor!: number;

  @IsInt()
  @Min(1)
  @Max(240)
  parcelas!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valorParcela?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  taxaJuros?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  descontoAVista?: number;

  /** Quanto seu dinheiro rende ao mês (%). Padrão: a melhor caixinha. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  rendimentoMensal?: number;

  @IsDateString()
  primeiraParcela!: string;
}

export class RegistrarParcelamentoDto extends SimularParcelamentoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  descricao!: string;

  /** Compra antiga: quantas parcelas já foram pagas antes de usar o app. */
  @IsOptional()
  @IsInt()
  @Min(0)
  parcelasPagas?: number;

  @IsOptional()
  @IsInt()
  contaId?: number;

  @IsOptional()
  @IsInt()
  categoriaId?: number;
}

export class MetaEconomiaDto {
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(90)
  metaEconomia!: number;
}
