import { IsEmail, IsString, MinLength } from 'class-validator';

export class createUsuarioDto {
  @IsEmail()
  email!: string 

  nome!: string 
  @IsString()
  @MinLength(6)
  senha!: string
  
}
