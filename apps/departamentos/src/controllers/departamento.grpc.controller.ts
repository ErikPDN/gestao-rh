import { Controller } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';
import {
  DEPARTAMENTO_SERVICE_NAME,
  GetDepartamentoRequest,
} from '@app/contracts';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class DepartamentoGrpcController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @GrpcMethod(DEPARTAMENTO_SERVICE_NAME, 'GetDepartamento')
  async getDepartamento(id: string) {
    const departamento = await this.departamentoService.getDepartamento(id);

    return {
      id: departamento.id,
      nome: departamento.nome,
      descricao: departamento.descricao,
    };
  }
}
