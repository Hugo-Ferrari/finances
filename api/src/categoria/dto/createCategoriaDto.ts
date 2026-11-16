import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class createCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome!: string;
}
