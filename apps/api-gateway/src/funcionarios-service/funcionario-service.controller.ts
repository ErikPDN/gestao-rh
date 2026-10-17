import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
} from '@nestjs/common';
import { FuncionarioService } from './funcionario-service.service.js';
import {
  GetFuncionariosQueryDto,
  CreateFuncionarioDto,
  UpdateFuncionarioDto,
  FuncionarioResult,
  FuncionarioPaginatedResult,
  FuncionarioDashboardResult,
} from '@app/contracts';

@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Get()
  getFuncionarios(
    @Query() query: GetFuncionariosQueryDto,
  ): Promise<FuncionarioPaginatedResult> {
    return this.funcionarioService.getFuncionarios(query);
  }

  @Post()
  createFuncionario(
    @Body() dto: CreateFuncionarioDto,
  ): Promise<FuncionarioResult> {
    return this.funcionarioService.createFuncionario(dto);
  }

  @Get('dashboard')
  getDashboard(): Promise<FuncionarioDashboardResult> {
    return this.funcionarioService.getDashboard();
  }

  @Get(':funcionarioId')
  getFuncionario(
    @Param('funcionarioId') id: string,
  ): Promise<FuncionarioResult> {
    return this.funcionarioService.getFuncionario(id);
  }

  @Patch(':funcionarioId')
  updateFuncionario(
    @Param('funcionarioId') id: string,
    @Body() dto: UpdateFuncionarioDto,
  ): Promise<FuncionarioResult> {
    return this.funcionarioService.updateFuncionario(id, dto);
  }

  @Post(':funcionarioId/demitir')
  demitirFuncionario(
    @Param('funcionarioId') id: string,
  ): Promise<FuncionarioResult> {
    return this.funcionarioService.demitirFuncionario(id);
  }
}
