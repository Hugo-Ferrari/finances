import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { CategoriaRepository } from './categoria.repoitory';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CategoriaController],
  imports: [PrismaModule],
  providers: [CategoriaService, CategoriaRepository],
})
export class CategoriaModule {}
