import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { ControllerIA } from './ia.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // ajuste ao seu caminho

@Module({
  imports: [PrismaModule],
  controllers: [ControllerIA],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}
