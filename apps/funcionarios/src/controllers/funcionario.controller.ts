import { Controller, Get, Query, Param, ParseUUIDPipe, Post, Body, Patch } from '@nestjs/common';
import { GetFuncionariosQueryDto, CreateFuncionarioDto, UpdateFuncionarioDto } from '@app/contracts';
import { FuncionarioService } from '../funcionario.service.js';

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
    @Param('funcionarioId', ParseUUIDPipe) id: string
  ) {
    return this.funcionarioService.getFuncionario(id)
  }

  @Patch(':funcionarioId')
  updateFuncionario(
    @Param('funcionarioId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFuncionarioDto
  ) {
    return this.funcionarioService.updateFuncionario(id, dto)
  }

  @Post(':funcionarioId/demitir')
  demitirFuncionario(
    @Param('funcionarioId', ParseUUIDPipe) id: string
  ) {
    return this.funcionarioService.demitirFuncionario(id)
  }
}
