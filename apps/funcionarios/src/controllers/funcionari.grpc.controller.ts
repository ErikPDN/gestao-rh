import { Controller } from '@nestjs/common';
import { FuncionarioResponse, FuncionarioServiceController, FuncionarioServiceControllerMethods, GetFuncionarioRequest } from '@app/contracts';
import { FuncionarioService } from '../funcionario.service.js';

@Controller()
@FuncionarioServiceControllerMethods()
export class FuncionarioGrpcController implements FuncionarioServiceController {
  constructor(private readonly funcionarioService: FuncionarioService) { }

  async getFuncionario(request: GetFuncionarioRequest): Promise<FuncionarioResponse> {
    const { id } = request;
    const funcionario = await this.funcionarioService.getFuncionario(id);

    return {
      id: funcionario.id,
      nome: funcionario.nome,
      cargoId: funcionario.cargoId,
      departamentoId: funcionario.departamentoId,
      salario: Number(funcionario.salario),
    }
  }
}
