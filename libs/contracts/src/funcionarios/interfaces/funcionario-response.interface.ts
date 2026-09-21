export interface FuncionarioResponse {
  id: string;
  cpfCnpj: string;
  nome: string;
  departamento: string;
  cargo: string;
  salario: number;
  dataNascimento: Date;
  dataAdmissao: Date;
  dataDemissao?: Date;
}
