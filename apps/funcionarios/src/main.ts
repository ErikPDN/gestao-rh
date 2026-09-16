import { NestFactory } from '@nestjs/core';
import { FuncionarioModule } from './funcionario.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(FuncionarioModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Funcionario está rodando em: ${process.env.PORT ?? 3001}`);
}
await bootstrap();
