import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ContaService } from './conta.service';
import { UpdateContaDto } from './dto/updateConta.dto';

@Controller('conta')
export class ContaController {
  constructor(private readonly contaService: ContaService) {}
  @Post()

  @Get()
  listar(){
    return this.contaService.listar()
  }
  @Get(':id')
  listarPorId(@Param('id',ParseIntPipe)id:number){
    const conta = this.contaService.buscarPorId(id)
    return conta
  }
  @Patch(':id')
  atualizar(@Param('id',ParseIntPipe)id:number,@Body() dto:UpdateContaDto){
    return this.contaService.atualizar(id,dto)
  }
  @Delete(':id')
  deletar(@Param('id',ParseIntPipe)id:number){
    return this.contaService.deletar(id)
  }
}
