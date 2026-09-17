import { NestFactory } from '@nestjs/core';
import { DepartamentoModule } from './departamento.module.js';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DEPARTAMENTO_PACKAGE_NAME } from '@app/contracts';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(DepartamentoModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: DEPARTAMENTO_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/departamento.proto'),
        url: process.env.DEPARTAMENTO_GRPC_URL ?? 'localhost:50051',
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Departamento está rodando em: ${process.env.PORT ?? 3002}`);
}
await bootstrap();
