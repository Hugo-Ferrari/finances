import { IsEnum, IsOptional, IsString } from "class-validator";
import { Tipo } from "src/generated/prisma/client.ts/enums";



export class createContaDto{
    @IsString()
    nome!: string 

    @IsEnum(Tipo)
    @IsOptional()
    tipo? : Tipo; // enuns
}