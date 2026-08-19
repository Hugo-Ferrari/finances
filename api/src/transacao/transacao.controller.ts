import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { TransacaoService } from './transacao.service';

@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}
  @Post()
  
  @Get() 
  listarTodos(){
    
  }
  @Get(':id')

  @Patch(':id')

  @Delete(':id')
}
