import { Module } from '@nestjs/common';
import { FuncionarioModule } from '../funcionarios-service/funcionario-service.module.js';
import { DepartamentoModule } from '../departamentos-service/departamento.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [FuncionarioModule, DepartamentoModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
