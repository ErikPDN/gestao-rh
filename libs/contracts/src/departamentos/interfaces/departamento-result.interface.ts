export interface DepartamentoResult {
  id: string;
  nome: string;
  descricao?: string;
  gestorId?: string;
  gestorNome?: string;
  totalCargos?: number;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}
