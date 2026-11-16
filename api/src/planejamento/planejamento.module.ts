import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransacaoModule } from 'src/transacao/transacao.module';
import {
  ParcelamentoController,
  PlanejamentoController,
  RecorrenteController,
} from './planejamento.controller';
import { PlanejamentoService } from './planejamento.service';
import { RecorrenteService } from './recorrente.service';
import { ParcelamentoService } from './parcelamento.service';

@Module({
  imports: [PrismaModule, TransacaoModule],
  controllers: [
    PlanejamentoController,
    RecorrenteController,
    ParcelamentoController,
  ],
  providers: [PlanejamentoService, RecorrenteService, ParcelamentoService],
})
export class PlanejamentoModule {}
