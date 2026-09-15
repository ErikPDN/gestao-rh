import { Controller, Get } from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';

@Controller()
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Get()
  getHello(): string {
    return this.funcionarioService.getHello();
  }
}
