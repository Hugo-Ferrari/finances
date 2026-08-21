import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { createTransacaoDto } from './dto/createTransacaoDto';
import { updateTransacaoDto } from './dto/updateTransacaoDto';

@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Post()
  criar(@Body() dto: createTransacaoDto, @Req() req) {
    return this.transacaoService.criar(dto, req.user.id);
  }

  @Get()
  listarTodos(@Req() req) {
    return this.transacaoService.listar(req.user.id);
  }

  @Get('categoria/:categoriaId')
  listarPorCategoria(@Req() req, @Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return this.transacaoService.listarPorCategoria(categoriaId, req.user.id);
  }

  @Get('conta/:contaId')
  listarPorConta(@Req() req, @Param('contaId', ParseIntPipe) contaId: number) {
    return this.transacaoService.buscarPorConta(contaId, req.user.id);
  }

  @Get(':id')
  listarPorId(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.transacaoService.buscarPorId(id, req.user.id);
  }

  @Patch(':id')
  atualizar(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: updateTransacaoDto) {
    return this.transacaoService.atualizar(dto, id, req.user.id);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.transacaoService.remover(id, req.user.id);
  }
}