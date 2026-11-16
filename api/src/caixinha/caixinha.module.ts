import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContaModule } from 'src/conta/conta.module';
import { CaixinhaController } from './caixinha.controller';
import { CaixinhaService } from './caixinha.service';

@Module({
  imports: [PrismaModule, ContaModule],
  controllers: [CaixinhaController],
  providers: [CaixinhaService],
})
export class CaixinhaModule {}
