import {
  DEPARTAMENTO_PACKAGE_NAME,
  DEPARTAMENTO_SERVICE_NAME,
  DepartamentoServiceClient,
} from '@app/contracts';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ServiceError, status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DepartamentoClientService implements OnModuleInit {
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

  async getDepartamento(id: string) {
    try {
      return await firstValueFrom(
        this.departamentoService.getDepartamento({ id }),
      );
    } catch (err) {
      const error = err as ServiceError;
      throw new HttpException(
        error.details ?? 'Internal Server Error',
        error.code === status.NOT_FOUND
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDepartamentos(ids: string[]) {
    try {
      const departamentosResult = await firstValueFrom(
        this.departamentoService.getDepartamentos({ ids }),
      );
      return departamentosResult.departamentos;
    } catch (err) {
      const error = err as ServiceError;
      throw new HttpException(
        error.details ?? 'Internal Server Error',
        error.code === status.NOT_FOUND
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCargo(cargoId: string, departamentoId: string) {
    try {
      return await firstValueFrom(
        this.departamentoService.getCargo({
          cargoId,
          departamentoId,
        }),
      );
    } catch (err) {
      const error = err as ServiceError;
      throw new HttpException(
        error.details ?? 'Internal Server Error',
        error.code === status.NOT_FOUND
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCargos(ids: string[]) {
    try {
      const cargosResult = await firstValueFrom(
        this.departamentoService.getCargos({ ids }),
      );
      return cargosResult.cargos;
    } catch (err) {
      const error = err as ServiceError;
      throw new HttpException(
        error.details ?? 'Internal Server Error',
        error.code === status.NOT_FOUND
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
