export interface CargoResult {
  id: string;
  nome: string;
  departamentoId: string;
  salarioBase: number;
  salarioTeto: number;
  nivel?: string;
  createdAt: Date;
  updatedAt: Date;
  ativo: boolean;
}
