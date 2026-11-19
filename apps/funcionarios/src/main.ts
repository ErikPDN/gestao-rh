import { NestFactory } from '@nestjs/core';
import { FuncionarioModule } from './funcionario.module.js';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FUNCIONARIO_PACKAGE_NAME } from '@app/contracts/funcionarios/index.js';
import { GRPC_LOADER_OPTIONS, HttpToRpcExceptionFilter } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const url = process.env.FUNCIONARIO_GRPC_URL ?? 'localhost:50052';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FuncionarioModule,
    {
      transport: Transport.GRPC,
      options: {
        package: FUNCIONARIO_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/funcionario.proto'),
        url,
        loader: GRPC_LOADER_OPTIONS,
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
  console.log(`Funcionario (gRPC) está rodando em: ${url}`);
}
await bootstrap();
