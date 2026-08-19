import { TipoTransacao } from './../../../dist/src/generated/prisma/enums.d';
import { Decimal } from "@prisma/client/runtime/client";

export interface createTransacaoDto{
    valor: Decimal
    descricao?: string
    tipoTransacao : TipoTransacao
    contaId: number
    categoriaId:number
}