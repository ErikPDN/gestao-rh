import { Module } from '@nestjs/common';
import { DepartamentoClientService } from './departamento-client.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEPARTAMENTO_PACKAGE_NAME } from '@app/contracts';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { grpcCredentials } from '@app/common/grpc/grpc-credentials.js';
import { GRPC_LOADER_OPTIONS } from '@app/common/grpc/grpc-loader.js';
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: DEPARTAMENTO_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: DEPARTAMENTO_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/departamento.proto'),
            url: configService.getOrThrow<string>('DEPARTAMENTO_GRPC_URL'),
            credentials: grpcCredentials(),
            loader: GRPC_LOADER_OPTIONS,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [DepartamentoClientService],
  exports: [DepartamentoClientService],
})
export class DepartamentoClientModule {}
