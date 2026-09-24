import { Module } from '@nestjs/common';
import { FuncionarioClientService } from './funcionario-client.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FUNCIONARIO_PACKAGE_NAME } from '@app/contracts';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: FUNCIONARIO_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: FUNCIONARIO_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/funcionario.proto'),
            url: configService.getOrThrow<string>('FUNCIONARIO_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      }
    ])
  ],
  providers: [FuncionarioClientService],
  exports: [FuncionarioClientService],
})
export class FuncionarioClientModule { }
