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
import { TransacaoService } from './transacao.service';
import { createTransacaoDto } from './dto/createTransacaoDto';
import { updateTransacaoDto } from './dto/updateTransacaoDto';

@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Get('resumo')
  obterResumo(
    @Req() req,
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    dataFim.setHours(23, 59, 59, 999);
    return this.transacaoService.obterResumo(req.user.id, dataInicio, dataFim);
  }
  @Get('despesas-por-categoria')
  async despesaPorCategoria(@Req() req) {
    return this.transacaoService.despesaPorCategoria(req.user.id);
  }
  @Get('periodo')
  listarPorPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
    @Req() req,
  ) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    dataFim.setHours(23, 59, 59, 999);

    return this.transacaoService.listarPorPeriodo(
      req.user.id,
      dataInicio,
      dataFim,
    );
  }
  @Get('resumo-total')
  obterResumoTotal(@Req() req) {
    
    return this.transacaoService.obterResumoTotal(req.user.id);
  }

  @Post()
  criar(@Body() dto: createTransacaoDto, @Req() req) {
    return this.transacaoService.criar(dto, req.user.id);
  }

  @Get()
  listarTodos(@Req() req) {
    return this.transacaoService.listar(req.user.id);
  }

  @Get('categoria/:categoriaId')
  listarPorCategoria(
    @Req() req,
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    return this.transacaoService.listarPorCategoria(categoriaId, req.user.id);
  }

  @Get('conta/:contaId')
  listarPorConta(@Req() req, @Param('contaId', ParseIntPipe) contaId: number) {
    return this.transacaoService.buscarPorConta(contaId, req.user.id);
  }

  @Patch(':id')
  atualizar(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateTransacaoDto,
  ) {
    return this.transacaoService.atualizar(dto, id, req.user.id);
  }

  @Delete(':id')
  deletar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.transacaoService.remover(id, req.user.id);
  }
}
