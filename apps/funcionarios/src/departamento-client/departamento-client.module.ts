import { Module } from '@nestjs/common';
import { DepartamentoClientService } from './departamento-client.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DEPARTAMENTO_PACKAGE_NAME } from '@app/contracts';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

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
