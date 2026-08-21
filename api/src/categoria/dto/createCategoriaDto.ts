import { IsString } from "class-validator";

export class createCategoriaDto{
    @IsString()
    nome!:string  
    
}