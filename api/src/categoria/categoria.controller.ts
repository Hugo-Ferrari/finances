import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}
  @Post()
  
  @Get()
  listar(){
    return this.categoriaService.listar()
  }
  @Get(':id')
  listarPorId(@Param('id',ParseIntPipe)id:number){
    return this.categoriaService.buscarPorId(id)
  }
  @Patch(':id')
  atualizar(@Param('id',ParseIntPipe)id:number, @Body()dto:UpdateCategoriaDto){
  return this.categoriaService.atualizar(id,dto)
  }
  @Delete(':id')
  deletar(@Param('id',ParseIntPipe)id:number){
    return this.categoriaService.deletar(id)
  }
}
