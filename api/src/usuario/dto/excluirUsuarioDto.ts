import { IsNotEmpty, IsString } from 'class-validator';

export class ExcluirUsuarioDto {
  @IsString()
  @IsNotEmpty()
  senha!: string;
}
