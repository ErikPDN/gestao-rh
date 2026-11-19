import { Module } from '@nestjs/common';
import { DepartamentoController } from './departamento.controller.js';
import { DepartamentoService } from './departamento.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CargoController } from './cargo.controller.js';
import { CargoService } from './cargo.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEPARTAMENTO_PACKAGE_NAME } from '@app/contracts';
import { grpcCredentials } from '@app/common/grpc/grpc-credentials.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/api-gateway/.env', '.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: DEPARTAMENTO_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: DEPARTAMENTO_PACKAGE_NAME,
            protoPath: 'proto/departamento.proto',
            url: configService.getOrThrow<string>('DEPARTAMENTO_GRPC_URL'),
            credentials: grpcCredentials(),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [DepartamentoController, CargoController],
  providers: [DepartamentoService, CargoService],
  exports: [DepartamentoService, CargoService],
})
export class DepartamentoModule {}
