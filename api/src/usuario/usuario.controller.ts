import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuarioService } from './usuario.service';
import { createUsuarioDto } from './dto/createUsuario.DTO';
import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import { ExcluirUsuarioDto } from './dto/excluirUsuarioDto';
import { Public } from 'src/common/decorators/public.decorator';

type AuthenticatedRequest = Request & {
  user: { id: number };
};

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  @Public()
  @Post()
  cadastro(@Body() dto: createUsuarioDto) {
    return this.usuarioService.criarUser(dto);
  }

  @Get()
  buscarPorId(@Req() req: AuthenticatedRequest) {
    return this.usuarioService.buscarId(req.user.id);
  }
  @Patch()
  atualizar(@Body() dto: UpdateUsuarioDto, @Req() req: AuthenticatedRequest) {
    return this.usuarioService.atualizar(req.user.id, dto);
  }

  @Delete()
  excluir(@Body() dto: ExcluirUsuarioDto, @Req() req: AuthenticatedRequest) {
    return this.usuarioService.excluirConta(req.user.id, dto.senha);
  }
}
