import { Decimal } from '@prisma/client/runtime/client';
import { IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoTransacao } from 'src/generated/prisma/client.ts/enums';


export class updateTransacaoDto {
  @IsOptional()
  @IsDecimal()
  valor?: Decimal;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsOptional()
  @IsEnum(TipoTransacao)
  tipoTransacao?: TipoTransacao;
}
