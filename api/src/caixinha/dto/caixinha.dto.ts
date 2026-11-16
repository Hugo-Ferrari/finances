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
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PeriodoTaxaDto {
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
}

export enum TipoMovimentoDto {
  DEPOSITO = 'DEPOSITO',
  RETIRADA = 'RETIRADA',
  AJUSTE = 'AJUSTE',
}

export class CriarCaixinhaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  instituicao?: string;

  @IsOptional()
  @IsBoolean()
  isentaIR?: boolean;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  taxa!: number;

  @IsEnum(PeriodoTaxaDto)
  periodo!: PeriodoTaxaDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valorInicial!: number;

  /** Dia em que o dinheiro foi aplicado (AAAA-MM-DD). Padrão: hoje. */
  @IsOptional()
  @IsDateString()
  dataInicial?: string;

  /** Conta de onde saiu o valor inicial (opcional). */
  @IsOptional()
  @IsInt()
  contaOrigemId?: number;
}

export class AtualizarCaixinhaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  instituicao?: string;

  @IsOptional()
  @IsBoolean()
  isentaIR?: boolean;
}

export class NovaTaxaDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  taxa!: number;

  @IsEnum(PeriodoTaxaDto)
  periodo!: PeriodoTaxaDto;

  /** A partir de quando vale (AAAA-MM-DD). Padrão: hoje. */
  @IsOptional()
  @IsDateString()
  inicio?: string;
}

export class NovoMovimentoDto {
  @IsEnum(TipoMovimentoDto)
  tipo!: TipoMovimentoDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor!: number;

  @IsOptional()
  @IsDateString()
  data?: string;

  /** Depósito: conta de onde sai. Retirada: conta para onde vai. */
  @IsOptional()
  @IsInt()
  contaId?: number;
}

export class PrevisaoQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(360)
  meses: number = 12;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  aporteMensal: number = 0;
}
