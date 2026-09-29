import { NestFactory } from '@nestjs/core';
import { FuncionarioModule } from './funcionario.module.js';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { FUNCIONARIO_PACKAGE_NAME } from '@app/contracts/funcionarios/index.js';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(FuncionarioModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: FUNCIONARIO_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/funcionario.proto'),
      url: process.env.FUNCIONARIO_GRPC_URL ?? 'localhost:50052',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Funcionario está rodando em: ${process.env.PORT ?? 3002}`);
}
await bootstrap();
