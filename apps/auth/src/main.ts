import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module.js';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '@app/contracts/auth/index.js';

async function bootstrap() {
  const url = process.env.AUTH_GRPC_URL ?? 'localhost:50053';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/auth.proto'),
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

  await app.listen();
  console.log(`Auth (gRPC) está rodando em: ${url}`);
}
await bootstrap();
