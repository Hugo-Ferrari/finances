import { Decimal } from '@prisma/client/runtime/client';
import { IsDate, IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';


export class updateTransacaoDto {
  @IsOptional()
  @IsDecimal()
  valor?: Decimal;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsDate()
  data?: Date;
}
