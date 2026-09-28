import {
  BadRequestException,
  Controller,
  Post,
  SetMetadata,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { IaService } from './ia.service';

@Controller('ia')
export class ControllerIA {
  constructor(private readonly serviceIa: IaService) {}

  @SetMetadata('isPublic', true)
  @Post('comprovante')
  @UseInterceptors(FileInterceptor('imagem'))
  analisarComprovante(@UploadedFile() imagem: Express.Multer.File) {
    if (!imagem) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    if (!tiposPermitidos.includes(imagem.mimetype)) {
      throw new BadRequestException(
        'Formato inválido. Envie JPG, JPEG ou PDF.',
      );
    }

    return this.serviceIa.analisarComprovante(
      imagem.buffer,
      imagem.mimetype,
    );
  }
}