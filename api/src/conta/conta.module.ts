import { Module } from '@nestjs/common';
import { ContaService } from './conta.service';
import { ContaController } from './conta.controller';
import { ContaRepository } from './conta.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ContaController],
  imports:[PrismaModule],
  providers: [ContaService, ContaRepository],
   exports: [ContaRepository],
})
export class ContaModule {}
