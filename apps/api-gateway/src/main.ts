import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3001);
  console.log(`API Gateway is running on: ${process.env.PORT ?? 3001}`);
}
await bootstrap();
