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
import { PlanejamentoService } from './planejamento.service';
import { RecorrenteService } from './recorrente.service';
import { ParcelamentoService } from './parcelamento.service';
import {
  AtualizarRecorrenteDto,
  CriarRecorrenteDto,
  MetaEconomiaDto,
  PagarRecorrenteDto,
  PularRecorrenteDto,
  RegistrarParcelamentoDto,
  SimularParcelamentoDto,
} from './dto/planejamento.dto';

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('planejamento')
export class PlanejamentoController {
  constructor(private readonly service: PlanejamentoService) {}

  @Get('gastar-hoje')
  gastarHoje(@Req() req: AuthenticatedRequest) {
    return this.service.gastarHoje(req.user.id);
  }

  @Get('meta')
  meta(@Req() req: AuthenticatedRequest) {
    return this.service.meta(req.user.id);
  }

  @Patch('meta')
  alterarMeta(@Body() dto: MetaEconomiaDto, @Req() req: AuthenticatedRequest) {
    return this.service.alterarMeta(req.user.id, dto.metaEconomia);
  }
}

@Controller('recorrente')
export class RecorrenteController {
  constructor(private readonly service: RecorrenteService) {}

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.service.listar(req.user.id);
  }

  @Post()
  criar(@Body() dto: CriarRecorrenteDto, @Req() req: AuthenticatedRequest) {
    return this.service.criar(dto, req.user.id);
  }

  @Get(':id')
  detalhar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.detalhar(id, req.user.id);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarRecorrenteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.atualizar(id, dto, req.user.id);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.remover(id, req.user.id);
  }

  @Post(':id/pagar')
  pagar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PagarRecorrenteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.pagar(id, dto, req.user.id);
  }

  @Post(':id/pular')
  pular(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PularRecorrenteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.pular(id, dto.competencia, req.user.id);
  }

  @Delete(':id/ocorrencias/:competencia')
  desfazer(
    @Param('id', ParseIntPipe) id: number,
    @Param('competencia') competencia: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.desfazer(id, competencia, req.user.id);
  }
}

@Controller('parcelamento')
export class ParcelamentoController {
  constructor(private readonly service: ParcelamentoService) {}

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.service.listar(req.user.id);
  }

  @Get('rendimento')
  rendimento(@Req() req: AuthenticatedRequest) {
    return this.service.rendimentoSugerido(req.user.id);
  }

  @Post('simular')
  simular(
    @Body() dto: SimularParcelamentoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.simular(dto, req.user.id);
  }

  @Post()
  registrar(
    @Body() dto: RegistrarParcelamentoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.registrar(dto, req.user.id);
  }
}
