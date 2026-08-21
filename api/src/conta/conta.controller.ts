import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ContaService } from './conta.service';
import { UpdateContaDto } from './dto/updateConta.dto';
import { createContaDto } from './dto/createConta.dto';

@Controller('conta')

export class ContaController {
  constructor(private readonly contaService: ContaService) {}
  @Post()
  criar(@Body() dto: createContaDto, @Req() req){
    return this.contaService.criar(dto, req.user.id)
  }

  
  @Get()
  listar(@Req() req){
    return this.contaService.listar(req.user.id)
  }

  @Get(':id')
  listarPorId(@Param('id',ParseIntPipe)id:number, @Req() req){
    const conta = this.contaService.buscarPorId(id,req.user.id)
    return conta
  }
  
  @Patch(':id')
  atualizar(@Param('id',ParseIntPipe)id:number,@Body() dto:UpdateContaDto, @Req() req){
    return this.contaService.atualizar(id,dto,req.user.id)
  }

  @Delete(':id')
  deletar(@Param('id',ParseIntPipe)id:number,@Req() req){
    return this.contaService.deletar(id,req.user.id)
  }
}
