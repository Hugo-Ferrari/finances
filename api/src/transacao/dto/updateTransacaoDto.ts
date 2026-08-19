import { Decimal } from "@prisma/client/runtime/client"
import { TipoTransacao } from "src/generated/prisma/enums"

export interface updateTransacaoDto{
        valor?: Decimal
        descricao?: string
        tipoTransacao ?: TipoTransacao
    
}