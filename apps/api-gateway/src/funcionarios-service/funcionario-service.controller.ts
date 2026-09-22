import { Controller } from '@nestjs/common';
import { FuncionarioService } from './funcionario-service.service.js'

@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) { }

}
