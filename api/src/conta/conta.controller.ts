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
import { ContaService } from './conta.service';
import { UpdateContaDto } from './dto/updateConta.dto';
import { createContaDto } from './dto/createConta.dto';

type AuthenticatedRequest = Request & {
  user: { id: number };
};

@Controller('conta')
export class ContaController {
  constructor(private readonly contaService: ContaService) {}
  @Post()
  criar(@Body() dto: createContaDto, @Req() req: AuthenticatedRequest) {
    return this.contaService.criar(dto, req.user.id);
  }

  @Get()
  listar(@Req() req: AuthenticatedRequest) {
    return this.contaService.listar(req.user.id);
  }

  @Get(':id')
  listarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const conta = this.contaService.buscarPorId(id, req.user.id);
    return conta;
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contaService.atualizar(id, dto, req.user.id);
  }

  @Delete(':id')
  deletar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contaService.deletar(id, req.user.id);
  }
}
