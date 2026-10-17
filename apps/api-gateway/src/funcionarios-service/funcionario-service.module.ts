import { Module } from '@nestjs/common';
import { FuncionarioController } from './funcionario-service.controller.js';
import { FuncionarioService } from './funcionario-service.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FUNCIONARIO_PACKAGE_NAME } from '@app/contracts';

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
