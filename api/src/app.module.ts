import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ContaModule } from './conta/conta.module';
import { CategoriaModule } from './categoria/categoria.module';
import { TransacaoModule } from './transacao/transacao.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtGuard } from './auth/guards/jwt-auth.guard';
import { OrcamentoModule } from './orcamento/orcamento.module';
import { IaModule } from './IA/ia.module';
import { CaixinhaModule } from './caixinha/caixinha.module';
import { PlanejamentoModule } from './planejamento/planejamento.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Limites aplicados só nas rotas marcadas com ThrottlerPorContaGuard.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
      errorMessage:
        'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    }),
    PrismaModule,
    UsuarioModule,
    ContaModule,
    CategoriaModule,
    TransacaoModule,
    AuthModule,
    OrcamentoModule,
    IaModule,
    CaixinhaModule,
    PlanejamentoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
