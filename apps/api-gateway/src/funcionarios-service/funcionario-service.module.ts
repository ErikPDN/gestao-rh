import { Module } from '@nestjs/common';
import { FuncionarioController } from './funcionario-service.controller.js';
import { FuncionarioService } from './funcionario-service.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FUNCIONARIO_PACKAGE_NAME } from '@app/contracts';
import { grpcCredentials } from '@app/common/grpc/grpc-credentials.js';
import { GRPC_LOADER_OPTIONS } from '@app/common/grpc/grpc-loader.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/api-gateway/.env', '.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: FUNCIONARIO_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: FUNCIONARIO_PACKAGE_NAME,
            protoPath: 'proto/funcionario.proto',
            url: configService.getOrThrow<string>('FUNCIONARIO_GRPC_URL'),
            credentials: grpcCredentials(),
            loader: GRPC_LOADER_OPTIONS,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [FuncionarioController],
  providers: [FuncionarioService],
  exports: [FuncionarioService],
})
export class FuncionarioModule {}
