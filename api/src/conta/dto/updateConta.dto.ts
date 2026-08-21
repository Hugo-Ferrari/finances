import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Tipo } from 'src/generated/prisma/client.ts/enums';




export class UpdateContaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEnum(Tipo)
  @IsOptional()
  tipo?: Tipo; // enuns
}
