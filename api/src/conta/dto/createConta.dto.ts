import { Tipo } from "src/generated/prisma/enums";

export interface createContaDto{
    nome : string 
    tipo? : Tipo; // enuns
    
}