import {
  CargoResponse,
  CargoResult,
  CreateCargoDto,
  DEPARTAMENTO_PACKAGE_NAME,
  DEPARTAMENTO_SERVICE_NAME,
  DepartamentoServiceClient,
  fromProtoCargoNivel,
  toProtoCargoNivel,
  UpdateCargoDto,
} from '@app/contracts';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CargoService implements OnModuleInit {
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

  async createCargo(departamentoId: string, dto: CreateCargoDto) {
    const response = await firstValueFrom(
      this.departamentoService.createCargo({
        departamentoId,
        nome: dto.nome,
        salarioBase: dto.salarioBase,
        salarioTeto: dto.salarioTeto,
        nivel: toProtoCargoNivel(dto.nivel),
        ativo: dto.ativo,
      }),
    );

    return this.toCargoResult(response);
  }

  async getAllCargos(departamentoId: string) {
    const response = await firstValueFrom(
      this.departamentoService.getCargos({ ids: [], departamentoId }),
    );

    return response.cargos.map((c) => this.toCargoResult(c));
  }

  async getCargo(departamentoId: string, cargoId: string) {
    const response = await firstValueFrom(
      this.departamentoService.getCargo({ departamentoId, cargoId }),
    );

    return this.toCargoResult(response);
  }

  async updateCargo(
    departamentoId: string,
    cargoId: string,
    dto: UpdateCargoDto,
  ) {
    const response = await firstValueFrom(
      this.departamentoService.updateCargo({
        departamentoId,
        cargoId,
        nome: dto.nome,
        salarioBase: dto.salarioBase,
        salarioTeto: dto.salarioTeto,
        nivel: toProtoCargoNivel(dto.nivel),
        ativo: dto.ativo,
      }),
    );

    return this.toCargoResult(response);
  }

  async desativarCargo(departamentoId: string, cargoId: string) {
    const response = await firstValueFrom(
      this.departamentoService.desativarCargo({ departamentoId, cargoId }),
    );

    return this.toCargoResult(response);
  }

  private toCargoResult(c: CargoResponse): CargoResult {
    return {
      ...c,
      nivel: fromProtoCargoNivel(c.nivel),
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    };
  }
}
