import { NestFactory } from '@nestjs/core';
import { FuncionarioModule } from './funcionario.module';

async function bootstrap() {
  const app = await NestFactory.create(FuncionarioModule);
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Funcionario está rodando em: ${process.env.PORT ?? 3001}`);
}
await bootstrap();
