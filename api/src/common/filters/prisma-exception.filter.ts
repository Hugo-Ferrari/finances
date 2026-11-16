import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from 'src/generated/prisma/client.ts/client';

const MENSAGENS_DUPLICADO: Record<string, string> = {
  Usuario: 'Este e-mail já está cadastrado.',
  Categoria: 'Você já tem uma categoria com esse nome.',
  Orcamento: 'Esta categoria já tem um orçamento.',
};

/**
 * Converte erros conhecidos do Prisma em respostas HTTP claras,
 * em vez de 500 (ex.: e-mail ou categoria duplicados).
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const modelo = (error.meta as { modelName?: string } | undefined)
      ?.modelName;

    let convertido: HttpException | undefined;
    switch (error.code) {
      case 'P2002':
        convertido = new ConflictException(
          (modelo && MENSAGENS_DUPLICADO[modelo]) ?? 'Registro duplicado.',
        );
        break;
      case 'P2003':
        convertido = new ConflictException(
          'Não é possível concluir: existem registros vinculados.',
        );
        break;
      case 'P2025':
        convertido = new NotFoundException('Registro não encontrado.');
        break;
    }

    super.catch(convertido ?? error, host);
  }
}
