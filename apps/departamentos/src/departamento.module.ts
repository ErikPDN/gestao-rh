import { Module } from '@nestjs/common';
import { DepartamentoService } from './services/departamento.service.js';
import { ConfigModule } from '@nestjs/config';
import { DepartamentoDatabase } from './database/ormconfig.departamento.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoGrpcController } from './controllers/departamento.grpc.controller.js';
import { CargoService } from './services/cargo.service.js';
import { Departamento } from './entities/departamento.entity.js';
import { Cargo } from './entities/cargo.entity.js';
import { FuncionarioClientModule } from './funcionario-client/funcionario-client.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/departamentos/.env', '.env'],
    }),
    TypeOrmModule.forRoot({ ...DepartamentoDatabase }),
    TypeOrmModule.forFeature([Departamento, Cargo]),
    FuncionarioClientModule,
  ],
  controllers: [DepartamentoGrpcController],
  providers: [DepartamentoService, CargoService],
})
export class DepartamentoModule { }
