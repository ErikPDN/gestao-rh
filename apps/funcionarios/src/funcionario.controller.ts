import { Controller, Get, Query } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service.js';
import { GetFuncionariosQueryDto } from '@app/contracts';

@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) { }

  @Get()
  getFuncionarios(
    @Query() query: GetFuncionariosQueryDto
  ) {
    return this.funcionarioService.getFuncionarios(query.funcionariosIds)
  }
}
