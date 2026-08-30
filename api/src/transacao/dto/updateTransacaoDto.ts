import { Decimal } from '@prisma/client/runtime/client';
import { IsDate, IsDecimal, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';


export class updateTransacaoDto {
  @IsOptional()
  @IsPositive()
  valor?: number;

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
