import { Controller } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';
import { DepartamentoServiceControllerMethods } from '@app/contracts';
import type {
  CargoResponse,
  CargosResponse,
  DepartamentoResponse,
  DepartamentoServiceController,
  DepartamentosResponse,
  GetCargoRequest,
  GetDepartamentoRequest,
  ListByIdsRequest,
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

  async getDepartamentos(
    request: ListByIdsRequest,
  ): Promise<DepartamentosResponse> {
    const { ids } = request;
    const departamentos = await this.departamentoService.getDepartamentos(ids);

    return {
      departamentos: departamentos.map((departamento) => ({
        id: departamento.id,
        nome: departamento.nome,
      })),
    };
  }

  async getCargo(request: GetCargoRequest): Promise<CargoResponse> {
    const { cargoId, departamentoId } = request;
    const cargo = await this.cargoService.getCargo(departamentoId, cargoId);

    return {
      id: cargo.id,
      nome: cargo.nome,
      departamentoId: cargo.departamentoId,
      salarioBase: Number(cargo.salarioBase),
      salarioTeto: Number(cargo.salarioTeto),
    };
  }

  async getCargos(request: ListByIdsRequest): Promise<CargosResponse> {
    const { ids } = request;
    const cargos = await this.cargoService.getCargos(ids);

    return {
      cargos: cargos.map((cargo) => ({
        id: cargo.id,
        nome: cargo.nome,
        departamentoId: cargo.departamentoId,
        salarioBase: Number(cargo.salarioBase),
        salarioTeto: Number(cargo.salarioTeto),
      })),
    };
  }
}
