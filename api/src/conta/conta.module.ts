import { Module } from '@nestjs/common';
import { ContaService } from './conta.service';
import { ContaController } from './conta.controller';
import { ContaRepository } from './conta.repository';

@Module({
  controllers: [ContaController],
  providers: [ContaService, ContaRepository],
})
export class ContaModule {}
