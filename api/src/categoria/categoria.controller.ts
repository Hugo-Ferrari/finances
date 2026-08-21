import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { UpdateCategoriaDto } from './dto/updateCategoriaDto';
import { createCategoriaDto } from './dto/createCategoriaDto';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}
  @Post()
  criar(@Body()dto:createCategoriaDto, @Req() req){
    return this.categoriaService.criar(dto,req.user.id)
  }
  @Get()
  listar(@Req() req){
    return this.categoriaService.listar(req.user.id)
  }
  @Get(':id')
  listarPorId(@Param('id',ParseIntPipe)id:number, @Req()req ){
    return this.categoriaService.buscarPorId(id,req.user.id)
  }
  @Patch(':id')
  atualizar(@Param('id',ParseIntPipe)id:number, @Body()dto:UpdateCategoriaDto,@Req()req){
  return this.categoriaService.atualizar(id,dto, req.user.id)
  }
  @Delete(':id')
  deletar(@Param('id',ParseIntPipe)id:number, @Req() req){
    return this.categoriaService.deletar(id,req.user.id)
  }
}
