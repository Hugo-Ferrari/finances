import { Decimal } from "@prisma/client/runtime/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Tipo } from "src/generated/prisma/client.ts/enums";



export class createContaDto{
    @IsString()
    nome!: string 

    @IsNumber()
    saldo!: Decimal
    @IsEnum(Tipo)
    @IsOptional()
    tipo? : Tipo; 
}