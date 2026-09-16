import { NestFactory } from '@nestjs/core';
import { DepartamentoModule } from './departamento.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(DepartamentoModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Departamento está rodando em: ${process.env.PORT ?? 3002}`);
}
await bootstrap();
