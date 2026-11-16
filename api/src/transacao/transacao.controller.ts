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
import { TransacaoService } from './transacao.service';
import { createTransacaoDto } from './dto/createTransacaoDto';
import { updateTransacaoDto } from './dto/updateTransacaoDto';
import { fimDoDia, inicioDoDia } from 'src/common/datas';

type AuthenticatedRequest = Request & {
  user: { id: number };
};

@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Get('resumo')
  obterResumo(
    @Req() req: AuthenticatedRequest,
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return this.transacaoService.obterResumo(
      req.user.id,
      inicioDoDia(inicio),
      fimDoDia(fim),
    );
  }
  @Get('despesas-por-categoria')
  async despesaPorCategoria(
    @Req() req: AuthenticatedRequest,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    const periodo =
      inicio && fim
        ? { inicio: inicioDoDia(inicio), fim: fimDoDia(fim) }
        : undefined;
    return this.transacaoService.despesaPorCategoria(req.user.id, periodo);
  }
  @Get('periodo')
  listarPorPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.transacaoService.listarPorPeriodo(
      req.user.id,
      inicioDoDia(inicio),
      fimDoDia(fim),
    );
  }
  @Get('resumo-total')
  obterResumoTotal(@Req() req: AuthenticatedRequest) {
    return this.transacaoService.obterResumoTotal(req.user.id);
  }

  @Post()
  criar(@Body() dto: createTransacaoDto, @Req() req: AuthenticatedRequest) {
    return this.transacaoService.criar(dto, req.user.id);
  }

  @Get()
  listarTodos(@Req() req: AuthenticatedRequest) {
    return this.transacaoService.listar(req.user.id);
  }

  @Get('categoria/:categoriaId')
  listarPorCategoria(
    @Req() req: AuthenticatedRequest,
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    return this.transacaoService.listarPorCategoria(categoriaId, req.user.id);
  }

  @Get('conta/:contaId')
  listarPorConta(
    @Req() req: AuthenticatedRequest,
    @Param('contaId', ParseIntPipe) contaId: number,
  ) {
    return this.transacaoService.buscarPorConta(contaId, req.user.id);
  }

  @Patch(':id')
  atualizar(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updateTransacaoDto,
  ) {
    return this.transacaoService.atualizar(dto, id, req.user.id);
  }

  @Delete(':id')
  deletar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.transacaoService.remover(id, req.user.id);
  }
}
