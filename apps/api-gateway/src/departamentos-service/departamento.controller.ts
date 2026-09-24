import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DepartamentoService } from './departamento.service.js';
import { CreateDepartamentoDto, GetDepartamentosQueryDto, UpdateDepartamentoDto } from '@app/contracts';

@Controller('departamentos')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) { }

  @Post()
  createDepartamento(
    @Body() createDepartamentoDto: CreateDepartamentoDto
  ) {
    return this.departamentoService.createDepartamento(createDepartamentoDto)
  }

  @Get()
  getDepartamentos(
    @Query() query: GetDepartamentosQueryDto
  ) {
    return this.departamentoService.getDepartamentos(query)
  }

  @Get(':departamentoId')
  getDepartamento(
    @Param('departamentoId') departamentoId: string
  ) {
    return this.departamentoService.getDepartamento(departamentoId)
  }



  @Patch(':departamentoId')
  updateDepartamento(
    @Param('departamentoId') departamentoId: string,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto
  ) {
    return this.departamentoService.updateDepartamento(departamentoId, updateDepartamentoDto)
  }

  @Post(':departamentoId/desativar')
  desativarDepartamento(
    @Param('departamentoId') departamentoId: string
  ) {
    return this.departamentoService.desativarDepartamento(departamentoId)
  }
}


