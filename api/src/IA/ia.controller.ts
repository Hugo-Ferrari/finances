import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerPorContaGuard } from 'src/common/guards/throttler-por-conta.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { IaService } from './ia.service';
import {
  TAMANHO_MAXIMO_ARQUIVO,
  TIPOS_ARQUIVO_PERMITIDOS,
} from './ia.constants';

type RequisicaoAutenticada = Request & { user: { id: number } };

@Controller('ia')
export class ControllerIA {
  constructor(private readonly serviceIa: IaService) {}

  @Post('comprovante')
  @UseGuards(ThrottlerPorContaGuard)
  @Throttle({ default: { limit: 20, ttl: 60 * 60_000 } })
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
      !(TIPOS_ARQUIVO_PERMITIDOS as readonly string[]).includes(
        arquivo.mimetype,
      )
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
