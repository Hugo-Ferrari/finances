import { Module } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { TransacaoController } from './transacao.controller';
import { TransacaoRepository } from './transacao.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContaModule } from 'src/conta/conta.module';

@Module({
  controllers: [TransacaoController],
  imports: [PrismaModule, ContaModule],
  providers: [TransacaoService, TransacaoRepository],
})
export class TransacaoModule {}
