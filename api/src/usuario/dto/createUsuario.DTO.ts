import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class createUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string 

  @IsString()
  nome!: string 

  @IsString()
  @MinLength(6)
  senha!: string
  
}
