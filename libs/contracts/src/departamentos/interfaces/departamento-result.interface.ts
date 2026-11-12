export interface DepartamentoResult {
  id: string;
  nome: string;
  descricao?: string;
  gestorId?: string;
  gestorNome?: string;
  gestorCargo?: string;
  totalCargos?: number;
  totalFuncionarios?: number;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}
