import { Controller, Get } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';

@Controller()
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}
}
