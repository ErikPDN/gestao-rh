import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFuncionarioDto {
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'cpfCnpj deve ter 11 ou 14 dígitos, sem pontuação',
  })
  cpfCnpj!: string;

  @IsString({ message: 'O nome do funcionário deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do funcionário não pode estar vazio' })
  @MaxLength(255, {
    message: 'O nome do funcionário deve ter no máximo 255 caracteres',
  })
  nome!: string;

  @IsUUID('4', { message: 'O ID do departamento deve ser um UUID válido' })
  departamentoId!: string;

  @IsUUID('4', { message: 'O ID do cargo deve ser um UUID válido' })
  cargoId!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O salário deve ser um número com no máximo 2 casas decimais' },
  )
  @IsPositive({ message: 'O salário deve ser um número positivo' })
  @Max(99999999.99, {
    message: 'O salário deve ser menor ou igual a 9999999999.99',
  })
  salario!: number;

  @Type(() => Date)
  @IsDate({ message: 'A data de nascimento deve ser uma data válida' })
  dataNascimento!: Date;

  @Type(() => Date)
  @IsDate({ message: 'A data de admissão deve ser uma data válida' })
  @IsOptional()
  dataAdmissao?: Date;
}
