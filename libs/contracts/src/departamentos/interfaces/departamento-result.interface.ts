export interface DepartamentoResult {
  id: string;
  nome: string;
  descricao?: string;
  gestorId?: string;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}
