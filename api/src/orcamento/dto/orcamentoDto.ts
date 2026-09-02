import {  IsNumber } from "class-validator";

export class CreateOrcamento{
    @IsNumber()
    valor!: number

    @IsNumber()
    categoriaId!: number
}

export class UpdateOrcamento{
    @IsNumber()
    valor?: number
}