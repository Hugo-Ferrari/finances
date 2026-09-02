import { Module } from '@nestjs/common';
import { OrcamentoService } from './orcamento.service';
import { OrcamentoController } from './orcamento.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsuarioRepository } from 'src/usuario/usuario.repository';
import { CategoriaRepository } from 'src/categoria/categoria.repoitory';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { CategoriaModule } from 'src/categoria/categoria.module';
import { OrcamentoRespository } from './orcamento.respository';

@Module({
  imports: [
    PrismaModule,
    UsuarioModule,
    CategoriaModule,
  ],
  controllers: [OrcamentoController],
  providers: [
    OrcamentoService,
    OrcamentoRespository,
    UsuarioRepository,
    CategoriaRepository,
  ],
})
export class OrcamentoModule {}