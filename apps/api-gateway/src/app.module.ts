import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FuncionarioModule } from './funcionarios-service/funcionario-service.module.js';
import { DepartamentoModule } from './departamentos-service/departamento.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/api-gateway/.env', '.env'],
    }),
    FuncionarioModule,
    DepartamentoModule,
  ],
})
export class AppModule { }
