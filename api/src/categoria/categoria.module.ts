import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { CategoriaRepository } from './categoria.repoitory';

@Module({
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaRepository],
})
export class CategoriaModule {}
