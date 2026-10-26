import {
  CreateDepartamentoDto,
  DEPARTAMENTO_PACKAGE_NAME,
  DEPARTAMENTO_SERVICE_NAME,
  DepartamentoDashboardResult,
  DepartamentoResponse,
  DepartamentoResult,
  DepartamentoServiceClient,
  GetDepartamentosQueryDto,
  toProtoStatusDepartamento,
  UpdateDepartamentoDto,
} from '@app/contracts';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DepartamentoService implements OnModuleInit {
  private departamentoService: DepartamentoServiceClient;

  constructor(
    @Inject(DEPARTAMENTO_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.departamentoService =
      this.client.getService<DepartamentoServiceClient>(
        DEPARTAMENTO_SERVICE_NAME,
      );
  }

  async createDepartamento(dto: CreateDepartamentoDto) {
    const response = await firstValueFrom(
      this.departamentoService.createDepartamento({
        nome: dto.nome,
        descricao: dto.descricao,
        gestorId: dto.gestorId,
        ativo: dto.ativo,
      }),
    );

    return this.toDepartamentoResult(response);
  }

  async getDashboard(): Promise<DepartamentoDashboardResult> {
    return firstValueFrom(this.departamentoService.getDashboard({}));
  }

  async getDepartamento(id: string) {
    const response = await firstValueFrom(
      this.departamentoService.getDepartamento({ id }),
    );

    return this.toDepartamentoResult(response);
  }

  async getDepartamentos(dto: GetDepartamentosQueryDto) {
    const response = await firstValueFrom(
      this.departamentoService.getDepartamentos({
        departamentoIds: dto.departamentoIds ?? [],
        query: dto.query,
        status: toProtoStatusDepartamento(dto.status),
        page: dto.page,
        limit: dto.limit,
      }),
    );

    return {
      data: response.departamentos.map((d) => this.toDepartamentoResult(d)),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    };
  }

  async updateDepartamento(id: string, dto: UpdateDepartamentoDto) {
    const response = await firstValueFrom(
      this.departamentoService.updateDepartamento({
        id,
        nome: dto.nome,
        descricao: dto.descricao,
        gestorId: dto.gestorId === null ? '' : dto.gestorId,
        ativo: dto.ativo,
      }),
    );

    return this.toDepartamentoResult(response);
  }

  async desativarDepartamento(id: string) {
    const response = await firstValueFrom(
      this.departamentoService.desativarDepartamento({ id }),
    );

    return this.toDepartamentoResult(response);
  }

  async reativarDepartamento(id: string) {
    const response = await firstValueFrom(
      this.departamentoService.reativarDepartamento({ id }),
    );

    return this.toDepartamentoResult(response);
  }

  private toDepartamentoResult(d: DepartamentoResponse): DepartamentoResult {
    return {
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    };
  }
}
