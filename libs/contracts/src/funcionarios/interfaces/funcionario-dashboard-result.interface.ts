import { AdmissoesRecentes } from '../types/admissoes-recentes.type.js';
import { FuncionarioDepartamento } from '../types/funcionario-departamento.type.js';

export interface FuncionarioDashboardResult {
  ativos: number;
  desligados: number;
  folhaSalarialMensal: number;
  funcionariosPorDepartamento: FuncionarioDepartamento[];
  admissoesRecentes: AdmissoesRecentes[];
}
