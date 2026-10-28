import { Controller } from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service.js';
import {
  DepartamentoServiceControllerMethods,
  fromProtoCargoNivel,
  fromProtoStatusDepartamento,
  NivelCargo,
  toProtoCargoNivel,
} from '@app/contracts';
import type {
  CargoResponse,
  CargoResult,
  CargosResponse,
  CreateCargoRequest,
  CreateDepartamentoRequest,
  DepartamentoDashboardResponse,
  DepartamentoResponse,
  DepartamentoResult,
  DepartamentoServiceController,
  DepartamentosResponse,
  GetCargoRequest,
  GetCargosRequest,
  GetDashboardRequest,
  GetDepartamentoRequest,
  GetDepartamentosRequest,
  RemoverGestorRequest,
  RemoverGestorResponse,
  UpdateCargoRequest,
  UpdateDepartamentoRequest,
} from '@app/contracts';
import { CargoService } from '../services/cargo.service.js';

@Controller()
@DepartamentoServiceControllerMethods()
export class DepartamentoGrpcController implements DepartamentoServiceController {
  constructor(
    private readonly departamentoService: DepartamentoService,
    private readonly cargoService: CargoService,
  ) {}

  async createDepartamento(
    request: CreateDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const departamento = await this.departamentoService.createDepartamento({
      nome: request.nome,
      descricao: request.descricao,
      gestorId: request.gestorId,
      ativo: request.ativo,
    });

    return this.toGrpcDepartamentoResponse(departamento);
  }

  async getDepartamento(
    request: GetDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const departamento = await this.departamentoService.getDepartamento(
      request.id,
    );

    return this.toGrpcDepartamentoResponse(departamento);
  }

  async getDepartamentos(
    request: GetDepartamentosRequest,
  ): Promise<DepartamentosResponse> {
    const { departamentoIds, query, status, page, limit } = request;
    const departamentos = await this.departamentoService.getDepartamentos({
      departamentoIds,
      query,
      status: fromProtoStatusDepartamento(status),
      page,
      limit,
    });

    return {
      departamentos: departamentos.data.map((departamento) =>
        this.toGrpcDepartamentoResponse(departamento),
      ),
      total: departamentos.total,
      page: departamentos.page,
      limit: departamentos.limit,
      totalPages: departamentos.totalPages,
    };
  }

  async getDashboard(
    _request: GetDashboardRequest,
  ): Promise<DepartamentoDashboardResponse> {
    return this.departamentoService.getDashboard();
  }

  async updateDepartamento(
    request: UpdateDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const { id, nome, descricao, gestorId, ativo } = request;
    const departamento = await this.departamentoService.updateDepartamento(id, {
      nome,
      descricao,
      // string vazia indica remoção do gestor (gRPC não distingue null de ausente)
      gestorId: gestorId === '' ? (null as unknown as undefined) : gestorId,
      ativo,
    });

    return this.toGrpcDepartamentoResponse(departamento);
  }

  async removerGestor(
    request: RemoverGestorRequest,
  ): Promise<RemoverGestorResponse> {
    const departamentosAtualizados =
      await this.departamentoService.removerGestor(request.funcionarioId);

    return { departamentosAtualizados };
  }

  async desativarDepartamento(
    request: GetDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const departamento = await this.departamentoService.desativarDepartamento(
      request.id,
    );

    return this.toGrpcDepartamentoResponse(departamento);
  }

  async reativarDepartamento(
    request: GetDepartamentoRequest,
  ): Promise<DepartamentoResponse> {
    const departamento = await this.departamentoService.reativarDepartamento(
      request.id,
    );

    return this.toGrpcDepartamentoResponse(departamento);
  }

  async createCargo(request: CreateCargoRequest): Promise<CargoResponse> {
    const { departamentoId, nome, salarioBase, salarioTeto, nivel, ativo } =
      request;
    const cargo = await this.cargoService.createCargo(departamentoId, {
      nome,
      salarioBase,
      salarioTeto,
      nivel: fromProtoCargoNivel(nivel),
      ativo,
    });

    return this.toGrpcCargoResponse(cargo);
  }

  async getCargo(request: GetCargoRequest): Promise<CargoResponse> {
    const { cargoId, departamentoId } = request;
    const cargo = await this.cargoService.getCargo(departamentoId, cargoId);

    return this.toGrpcCargoResponse(cargo);
  }

  async getCargos(request: GetCargosRequest): Promise<CargosResponse> {
    const { ids, departamentoId } = request;
    const cargos = departamentoId
      ? await this.cargoService.listCargos(departamentoId)
      : await this.cargoService.getCargos(ids);

    return {
      cargos: cargos.map((cargo) => this.toGrpcCargoResponse(cargo)),
    };
  }

  async updateCargo(request: UpdateCargoRequest): Promise<CargoResponse> {
    const {
      departamentoId,
      cargoId,
      nome,
      salarioBase,
      salarioTeto,
      nivel,
      ativo,
    } = request;
    const cargo = await this.cargoService.updateCargo(departamentoId, cargoId, {
      nome,
      salarioBase,
      salarioTeto,
      nivel: fromProtoCargoNivel(nivel),
      ativo,
    });

    return this.toGrpcCargoResponse(cargo);
  }

  async desativarCargo(request: GetCargoRequest): Promise<CargoResponse> {
    const { cargoId, departamentoId } = request;
    const cargo = await this.cargoService.desativarCargo(
      departamentoId,
      cargoId,
    );

    return this.toGrpcCargoResponse(cargo);
  }

  private toGrpcDepartamentoResponse(
    departamento: DepartamentoResult,
  ): DepartamentoResponse {
    return {
      id: departamento.id,
      nome: departamento.nome,
      descricao: departamento.descricao,
      gestorId: departamento.gestorId,
      gestorNome: departamento.gestorNome,
      gestorCargo: departamento.gestorCargo,
      totalCargos: departamento.totalCargos,
      totalFuncionarios: departamento.totalFuncionarios,
      createdAt: new Date(departamento.createdAt).toISOString(),
      updatedAt: new Date(departamento.updatedAt).toISOString(),
      ativo: departamento.ativo,
    };
  }

  private toGrpcCargoResponse(cargo: CargoResult): CargoResponse {
    return {
      id: cargo.id,
      nome: cargo.nome,
      departamentoId: cargo.departamentoId,
      salarioBase: Number(cargo.salarioBase),
      salarioTeto: Number(cargo.salarioTeto),
      nivel: toProtoCargoNivel(cargo.nivel as NivelCargo | undefined),
      createdAt: new Date(cargo.createdAt).toISOString(),
      updatedAt: new Date(cargo.updatedAt).toISOString(),
      ativo: cargo.ativo,
    };
  }
}
