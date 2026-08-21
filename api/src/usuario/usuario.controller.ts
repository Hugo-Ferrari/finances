import { Body, Controller, Delete, Patch, Post, Req} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { createUsuarioDto } from './dto/createUsuario.DTO';
import { UpdateUsuarioDto } from './dto/updateUsuarioDto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  @Public()
  @Post()
  cadastro(@Body() dto: createUsuarioDto) {
    return this.usuarioService.criarUser(dto);
  }

  @Patch()
  atualizar(@Body() dto: UpdateUsuarioDto, @Req() req) {
    return this.usuarioService.atualizar(req.user.id, dto);
  }

  @Delete()
  deletar(@Req() req){
    return this.usuarioService.deletar(req.user.id)
  }
}
