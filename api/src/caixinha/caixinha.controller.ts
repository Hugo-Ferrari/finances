import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CaixinhaService } from './caixinha.service';
import {
  AtualizarCaixinhaDto,
  CriarCaixinhaDto,
  NovaTaxaDto,
  NovoMovimentoDto,
  PrevisaoQueryDto,
} from './dto/caixinha.dto';

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('caixinha')
export class CaixinhaController {
  constructor(private readonly service: CaixinhaService) {}

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.service.listar(req.user.id);
  }

  @Post()
  criar(@Body() dto: CriarCaixinhaDto, @Req() req: AuthenticatedRequest) {
    return this.service.criar(dto, req.user.id);
  }

  @Get(':id')
  detalhar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.detalhar(id, req.user.id);
  }

  @Get(':id/previsao')
  previsao(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PrevisaoQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.previsao(id, query, req.user.id);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarCaixinhaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.atualizar(id, dto, req.user.id);
  }

  @Post(':id/taxa')
  novaTaxa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NovaTaxaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.novaTaxa(id, dto, req.user.id);
  }

  @Post(':id/movimentos')
  novoMovimento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NovoMovimentoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.novoMovimento(id, dto, req.user.id);
  }

  @Delete(':id/movimentos/:movimentoId')
  removerMovimento(
    @Param('id', ParseIntPipe) id: number,
    @Param('movimentoId', ParseIntPipe) movimentoId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.removerMovimento(id, movimentoId, req.user.id);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.remover(id, req.user.id);
  }
}
