import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { IaService } from './ia.service';
import {
  TAMANHO_MAXIMO_ARQUIVO,
  TIPOS_ARQUIVO_PERMITIDOS,
} from './ia.constants';

type RequisicaoAutenticada = Request & { user: { id: number; email: string } };

@Controller('ia')
export class ControllerIA {
  constructor(private readonly serviceIa: IaService) {}

  @Post('comprovante')
  @UseInterceptors(
    FileInterceptor('imagem', { limits: { fileSize: TAMANHO_MAXIMO_ARQUIVO } }),
  )
  analisarComprovante(
    @Req() req: RequisicaoAutenticada,
    @UploadedFile() arquivo: Express.Multer.File,
  ) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (
      !(TIPOS_ARQUIVO_PERMITIDOS as readonly string[]).includes(arquivo.mimetype)
    ) {
      throw new BadRequestException(
        'Formato inválido. Envie JPG, PNG, WEBP ou PDF.',
      );
    }

    return this.serviceIa.analisarComprovante(
      req.user.id,
      arquivo.buffer,
      arquivo.mimetype,
    );
  }
}