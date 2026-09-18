import { Controller, Get } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';

@Controller('departamentos')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}
}
