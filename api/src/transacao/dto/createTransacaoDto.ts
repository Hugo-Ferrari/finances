import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { TipoTransacao } from 'src/generated/prisma/client.ts/enums';

export class createTransacaoDto {
  @IsPositive()
  valor!: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(TipoTransacao)
  tipoTransacao!: TipoTransacao;

  @IsInt()
  contaId!: number;

  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsDateString()
  data?: string;
}
