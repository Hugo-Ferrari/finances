import { IsEmail, IsOptional } from "class-validator"

export class UpdateUsuarioDto {
  @IsEmail()
  @IsOptional()
  email?: string 
  

}
