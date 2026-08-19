import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export interface createUsuarioDto {
  nome: string;
  email: string 
  senha: string 
  cpf: string 
}
