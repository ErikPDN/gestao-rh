import { Module } from '@nestjs/common';
import { DepartamentoController } from './controllers/departamento.controller.js';
import { DepartamentoService } from './services/departamento.service.js';
import { ConfigModule } from '@nestjs/config';
import { DepartamentoDatabase } from './database/ormconfig.departamento.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoGrpcController } from './controllers/departamento.grpc.controller.js';
import { CargoController } from './controllers/cargo.controller.js';
import { CargoService } from './services/cargo.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/departamentos/.env', '.env'],
    }),
    TypeOrmModule.forRoot({ ...DepartamentoDatabase }),
  ],
  controllers: [
    DepartamentoController,
    DepartamentoGrpcController,
    CargoController,
  ],
  providers: [DepartamentoService, CargoService],
})
export class DepartamentoModule {}
