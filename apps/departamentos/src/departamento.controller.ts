import { Controller, Get } from '@nestjs/common';
import { DepartamentoService } from './departamento.service.js';

@Controller()
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @Get()
  getHello(): string {
    return this.departamentoService.getHello();
  }
}
