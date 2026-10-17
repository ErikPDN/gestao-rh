import { Controller } from '@nestjs/common';
import {
  ContarPorDepartamentoRequest,
  ContarPorDepartamentoResponse,
  FuncionarioDashboardResponse,
  FuncionarioResponse,
  FuncionarioResult,
  FuncionarioServiceController,
  FuncionarioServiceControllerMethods,
  GetFuncionarioRequest,
  FuncionariosResponse,
  GetFuncionariosRequest,
  UpdateFuncionarioRequest,
  CreateFuncionarioRequest,
  fromProtoStatus,
} from '@app/contracts';
import { FuncionarioService } from '../funcionario.service.js';

@Controller()
@FuncionarioServiceControllerMethods()
export class FuncionarioGrpcController implements FuncionarioServiceController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  async getFuncionario(
    request: GetFuncionarioRequest,
  ): Promise<FuncionarioResponse> {
    const { id } = request;
    const funcionario = await this.funcionarioService.getFuncionario(id);

    return this.toGrpcResponse(funcionario);
  }

  async getDashboard(): Promise<FuncionarioDashboardResponse> {
    const dashboard = await this.funcionarioService.getDashboard();

    return {
      ...dashboard,
      admissoesRecentes: dashboard.admissoesRecentes.map((a) => ({
        ...a,
        dataAdmissao: new Date(a.dataAdmissao).toISOString(),
      })),
    };
  }

  async contarPorDepartamento(
    request: ContarPorDepartamentoRequest,
  ): Promise<ContarPorDepartamentoResponse> {
    const { departamentoIds } = request;
    const funcionariosPorDepartamento =
      await this.funcionarioService.contarPorDepartamento(departamentoIds);

    return {
      contagens: funcionariosPorDepartamento.map((f) => ({
        departamentoId: f.departamentoId,
        quantidadeFuncionarios: f.quantidadeFuncionarios,
      })),
    };
  }

  async getFuncionarios(
    request: GetFuncionariosRequest,
  ): Promise<FuncionariosResponse> {
    const { funcionarioIds, page, limit, query, status } = request;
    const funcionarios = await this.funcionarioService.getFuncionarios({
      funcionarioIds,
      page,
      limit,
      query,
      status: fromProtoStatus(status),
    });

    return {
      data: funcionarios.data.map((f) => this.toGrpcResponse(f)),
      total: funcionarios.total,
      page: funcionarios.page,
      limit: funcionarios.limit,
      totalPages: funcionarios.totalPages,
    };
  }

  async createFuncionario(
    request: CreateFuncionarioRequest,
  ): Promise<FuncionarioResponse> {
    const {
      cpfCnpj,
      nome,
      departamentoId,
      cargoId,
      salario,
      dataNascimento,
      dataAdmissao,
    } = request;
    const funcionario = await this.funcionarioService.createFuncionario({
      cpfCnpj,
      nome,
      departamentoId,
      cargoId,
      salario,
      dataNascimento: new Date(dataNascimento),
      dataAdmissao: dataAdmissao ? new Date(dataAdmissao) : undefined,
    });

    return this.toGrpcResponse(funcionario);
  }

  async updateFuncionario(
    request: UpdateFuncionarioRequest,
  ): Promise<FuncionarioResponse> {
    const { id, nome, departamentoId, cargoId, salario, dataNascimento } =
      request;
    const funcionario = await this.funcionarioService.updateFuncionario(id, {
      nome,
      departamentoId,
      cargoId,
      salario,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
    });

    return this.toGrpcResponse(funcionario);
  }

  async demitirFuncionario(
    request: GetFuncionarioRequest,
  ): Promise<FuncionarioResponse> {
    const { id } = request;
    const funcionario = await this.funcionarioService.demitirFuncionario(id);

    return this.toGrpcResponse(funcionario);
  }

  private toGrpcResponse(f: FuncionarioResult): FuncionarioResponse {
    return {
      id: f.id,
      cpfCnpj: f.cpfCnpj,
      nome: f.nome,
      cargo: f.cargo,
      cargoId: f.cargoId,
      departamento: f.departamento,
      departamentoId: f.departamentoId,
      salario: Number(f.salario),
      dataNascimento: new Date(f.dataNascimento).toISOString(),
      dataAdmissao: new Date(f.dataAdmissao).toISOString(),
      dataDemissao: f.dataDemissao
        ? new Date(f.dataDemissao).toISOString()
        : undefined,
    };
  }
}
