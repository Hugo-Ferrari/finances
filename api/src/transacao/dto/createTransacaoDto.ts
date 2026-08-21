import { IsDecimal, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { Decimal } from '@prisma/client/runtime/client';
import { TipoTransacao } from 'src/generated/prisma/client.ts/enums';

export class createTransacaoDto {
  @IsDecimal()
  valor!: Decimal;

  @IsOptional()
  @IsString()
  descricao?: string;


  @IsEnum(TipoTransacao)
  tipoTransacao!: TipoTransacao;


  @IsInt()
  contaId!: number;

  @IsInt()
  categoriaId!: number;
}
