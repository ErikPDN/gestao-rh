import { FuncionarioResult } from './funcionario-result.interface.js';

export interface FuncionarioPaginatedResult {
  data: FuncionarioResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
