import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrcamentoService } from './orcamento.service';
import { CreateOrcamento, UpdateOrcamento } from './dto/orcamentoDto';

type AuthenticatedRequest = Request & {
  user: { id: number };
};

@Controller('orcamento')
export class OrcamentoController {
  constructor(private readonly orcamentoService: OrcamentoService) {}

  @Post()
  criar(@Body() dados: CreateOrcamento, @Req() req: AuthenticatedRequest) {
    return this.orcamentoService.criar(dados, req.user.id);
  }
  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.orcamentoService.listar(req.user.id);
  }

  @Patch(':id')
  atualizar(
    @Req() req: AuthenticatedRequest,
    @Body() dados: UpdateOrcamento,
    @Param('id', ParseIntPipe) id: number,
    categoriaId: number,
  ) {
    return this.orcamentoService.atualizar(id, dados, req.user.id, categoriaId);
  }
  @Delete(':id')
  deletar(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orcamentoService.delete(id, req.user.id);
  }
}
