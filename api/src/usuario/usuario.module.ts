import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioRepository } from './usuario.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UsuarioController],
  imports:[PrismaModule],
  providers: [UsuarioService, UsuarioRepository],
  exports: [UsuarioRepository]
})
export class UsuarioModule {}
