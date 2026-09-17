import { Module } from '@nestjs/common';
import { DepartamentoController } from './controllers/departamento.controller.js';
import { DepartamentoService } from './services/departamento.service.js';
import { ConfigModule } from '@nestjs/config';
import { DepartamentoDatabase } from './database/ormconfig.departamento.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/departamentos/.env', '.env'],
    }),
    TypeOrmModule.forRoot({ ...DepartamentoDatabase }),
  ],
  controllers: [DepartamentoController],
  providers: [DepartamentoService],
})
export class DepartamentoModule {}
