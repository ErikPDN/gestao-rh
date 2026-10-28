import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  CreateFuncionarioDto,
  UpdateFuncionarioDto,
  GetFuncionariosQueryDto,
  FuncionarioDashboardResult,
  FuncionarioResponse,
  FuncionarioResult,
  FuncionarioServiceClient,
  FUNCIONARIO_PACKAGE_NAME,
  FUNCIONARIO_SERVICE_NAME,
  toProtoStatus,
} from '@app/contracts';
import { type ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class FuncionarioService implements OnModuleInit {
  private funcionarioService: FuncionarioServiceClient;

  constructor(
    @Inject(FUNCIONARIO_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.funcionarioService = this.client.getService<FuncionarioServiceClient>(
      FUNCIONARIO_SERVICE_NAME,
    );
  }

  async getFuncionarios(dto: GetFuncionariosQueryDto) {
    const response = await firstValueFrom(
      this.funcionarioService.getFuncionarios({
        funcionarioIds: dto.funcionarioIds ?? [],
        page: dto.page,
        limit: dto.limit,
        query: dto.query,
        status: toProtoStatus(dto.status),
        departamentoId: dto.departamentoId,
      }),
    );

    return {
      ...response,
      data: response.data.map((f) => this.toFuncionarioResult(f)),
    };
  }

  async createFuncionario(dto: CreateFuncionarioDto) {
    const response = await firstValueFrom(
      this.funcionarioService.createFuncionario({
        nome: dto.nome,
        cpfCnpj: dto.cpfCnpj,
        departamentoId: dto.departamentoId,
        cargoId: dto.cargoId,
        salario: dto.salario,
        dataNascimento: new Date(dto.dataNascimento).toISOString(),
        dataAdmissao: new Date(dto.dataAdmissao || new Date()).toISOString(),
      }),
    );

    return this.toFuncionarioResult(response);
  }

  async getDashboard(): Promise<FuncionarioDashboardResult> {
    const response = await firstValueFrom(
      this.funcionarioService.getDashboard({}),
    );

    return {
      ...response,
      admissoesRecentes: response.admissoesRecentes.map((a) => ({
        ...a,
        dataAdmissao: new Date(a.dataAdmissao),
      })),
    };
  }

  async getFuncionario(id: string) {
    const response = await firstValueFrom(
      this.funcionarioService.getFuncionario({ id }),
    );

    return this.toFuncionarioResult(response);
  }

  async updateFuncionario(id: string, dto: UpdateFuncionarioDto) {
    const response = await firstValueFrom(
      this.funcionarioService.updateFuncionario({
        id,
        nome: dto.nome,
        departamentoId: dto.departamentoId,
        cargoId: dto.cargoId,
        salario: dto.salario,
        dataNascimento: dto.dataNascimento
          ? new Date(dto.dataNascimento).toISOString()
          : undefined,
      }),
    );

    return this.toFuncionarioResult(response);
  }

  async demitirFuncionario(id: string) {
    const response = await firstValueFrom(
      this.funcionarioService.demitirFuncionario({ id }),
    );

    return this.toFuncionarioResult(response);
  }

  private toFuncionarioResult(f: FuncionarioResponse): FuncionarioResult {
    return {
      ...f,
      dataNascimento: new Date(f.dataNascimento),
      dataAdmissao: new Date(f.dataAdmissao),
      dataDemissao: f.dataDemissao ? new Date(f.dataDemissao) : undefined,
    };
  }
}
