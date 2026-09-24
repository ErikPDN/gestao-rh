import { FUNCIONARIO_PACKAGE_NAME, FUNCIONARIO_SERVICE_NAME, FuncionarioServiceClient } from '@app/contracts';
import { Injectable, OnModuleInit, Inject, HttpException, HttpStatus } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ServiceError, status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FuncionarioClientService implements OnModuleInit {
  private funcionarioService: FuncionarioServiceClient

  constructor(
    @Inject(FUNCIONARIO_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.funcionarioService =
      this.client.getService<FuncionarioServiceClient>(
        FUNCIONARIO_SERVICE_NAME
      )
  }

  async getFuncionario(id: string) {
    try {
      return await firstValueFrom(
        this.funcionarioService.getFuncionario({ id })
      )
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
