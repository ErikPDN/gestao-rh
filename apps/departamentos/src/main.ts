import { NestFactory } from '@nestjs/core';
import { DepartamentoModule } from './departamento.module.js';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DEPARTAMENTO_PACKAGE_NAME } from '@app/contracts';
import { join } from 'path';
import { HttpToRpcExceptionFilter } from '@app/common';

async function bootstrap() {
  const url = process.env.DEPARTAMENTO_GRPC_URL ?? 'localhost:50051';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DepartamentoModule,
    {
      transport: Transport.GRPC,
      options: {
        package: DEPARTAMENTO_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/departamento.proto'),
        url,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpToRpcExceptionFilter());

  await app.listen();
  console.log(`Departamento (gRPC) está rodando em: ${url}`);
}
await bootstrap();
