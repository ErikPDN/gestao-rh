import { Injectable } from '@nestjs/common';
import { FuncionarioService } from '../funcionarios-service/funcionario-service.service.js';
import { DepartamentoService } from '../departamentos-service/departamento.service.js';
import { DashboardResult } from '@app/contracts/dashboard/interfaces/dashboard-result.interface.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly funcionarioService: FuncionarioService,
    private readonly departamentoService: DepartamentoService,
  ) {}

  async getDashboard(): Promise<DashboardResult> {
    const [f, d] = await Promise.all([
      this.funcionarioService.getDashboard(),
      this.departamentoService.getDashboard(),
    ]);

    return {
      funcionariosAtivos: f.ativos,
      funcionariosDesligados: f.desligados,
      departamentosAtivos: d.ativos,
      departamentosCadastrados: d.totalCadastrados,
      cargosAtivos: d.cargosAtivos,
      folhaSalarialMensal: f.folhaSalarialMensal,
      funcionariosPorDepartamento: f.funcionariosPorDepartamento,
      admissoesRecentes: f.admissoesRecentes,
    };
  }
}
