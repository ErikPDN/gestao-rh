import { Controller, Get } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service.js';

@Controller()
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}
}
