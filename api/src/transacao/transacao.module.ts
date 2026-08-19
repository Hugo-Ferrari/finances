import { Module } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { TransacaoController } from './transacao.controller';
import { TransacaoRepository } from './transacao.repository';

@Module({
  controllers: [TransacaoController],
  providers: [TransacaoService, TransacaoRepository],
})
export class TransacaoModule {}
