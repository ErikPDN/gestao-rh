import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { FuncionarioService } from './funcionario.service.js';
import { FuncionarioController } from './funcionario.controller.js';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuncionarioDatabase } from './database/ormconfig.funcionario.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/funcionarios/.env', '.env'],
    }),
    TypeOrmModule.forRoot({ ...FuncionarioDatabase }),
  ],
  controllers: [FuncionarioController],
  providers: [FuncionarioService],
})
export class FuncionarioModule {}
