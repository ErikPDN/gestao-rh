import { Controller } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';
import { DepartamentoServiceControllerMethods } from '@app/contracts';
import type {
  CargoResponse,
  DepartamentoResponse,
  DepartamentoServiceController,
  GetCargoRequest,
  GetDepartamentoRequest,
} from '@app/contracts';
import { CargoService } from '../services/cargo.service.js';

@Controller()
@DepartamentoServiceControllerMethods()
export class DepartamentoGrpcController implements DepartamentoServiceController {
  constructor(
    private readonly departamentoService: DepartamentoService,
    private readonly cargoService: CargoService,
  ) {}

  async getDepartamento(
    request: GetDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const { id } = request;
    const departamento = await this.departamentoService.getDepartamento(id);

    return {
      id: departamento.id,
      nome: departamento.nome,
    };
  }

  async getCargo(request: GetCargoRequest): Promise<CargoResponse> {
    const { cargoId, departamentoId } = request;
    const cargo = await this.cargoService.getCargo(cargoId, departamentoId);

    return {
      id: cargo.id,
      nome: cargo.nome,
      departamentoId: cargo.departamentoId,
    };
  }
}
