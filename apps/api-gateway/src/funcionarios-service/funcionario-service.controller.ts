import { Controller, Get, Post, Patch, Query, Body, Param } from '@nestjs/common';
import { FuncionarioService } from './funcionario-service.service.js'
import { GetFuncionariosQueryDto, CreateFuncionarioDto, UpdateFuncionarioDto } from '@app/contracts';


@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) { }

  @Get()
  getFuncionarios(
    @Query() query: GetFuncionariosQueryDto
  ) {
    return this.funcionarioService.getFuncionarios(query)
  }

  @Post()
  createFuncionario(
    @Body() dto: CreateFuncionarioDto
  ) {
    return this.funcionarioService.createFuncionario(dto)
  }

  @Get(':funcionarioId')
  getFuncionario(
    @Param('funcionarioId') id: string
  ) {
    return this.funcionarioService.getFuncionario(id)
  }

  @Patch(':funcionarioId')
  updateFuncionario(
    @Param('funcionarioId') id: string,
    @Body() dto: UpdateFuncionarioDto
  ) {
    return this.funcionarioService.updateFuncionario(id, dto)
  }

  @Post(':funcionarioId/demitir')
  demitirFuncionario(
    @Param('funcionarioId') id: string
  ) {
    return this.funcionarioService.demitirFuncionario(id)
  }
}
