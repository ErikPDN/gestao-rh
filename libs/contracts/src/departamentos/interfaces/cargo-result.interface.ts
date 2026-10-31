export interface CargoResult {
  id: string;
  nome: string;
  departamentoId: string;
  salarioBase: number;
  salarioTeto: number;
  nivel?: string;
  totalFuncionarios?: number;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}
