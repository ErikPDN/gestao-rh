import { AdmissoesRecentes } from '../../funcionarios/types/admissoes-recentes.type.js';
import { FuncionarioDepartamento } from '../../funcionarios/types/funcionario-departamento.type.js';

export interface DashboardResult {
  funcionariosAtivos: number;
  funcionariosDesligados: number;
  departamentosAtivos: number;
  departamentosCadastrados: number;
  cargosAtivos: number;
  folhaSalarialMensal: number;
  funcionariosPorDepartamento: FuncionarioDepartamento[];
  admissoesRecentes: AdmissoesRecentes[];
}
