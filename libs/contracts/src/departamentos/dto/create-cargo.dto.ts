import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { NivelCargo } from '../enums/nivel-cargo.enum.js';

export class CreateCargoDto {
  @IsString({ message: 'O nome do cargo deve ser uma string' })
  @MinLength(3, { message: 'O nome do cargo deve ter no mínimo 3 caracteres' })
  @MaxLength(255, {
    message: 'O nome do cargo deve ter no máximo 255 caracteres',
  })
  nome: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'O salário base deve ser um número com no máximo 2 casas decimais',
    },
  )
  @Min(0, { message: 'O salário base deve ser maior ou igual a zero' })
  salarioBase: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'O salário teto deve ser um número com no máximo 2 casas decimais',
    },
  )
  @Min(0, { message: 'O salário teto deve ser maior ou igual a zero' })
  salarioTeto: number;

  @IsOptional()
  @IsEnum(NivelCargo, { message: 'O nível do cargo deve ser um valor válido' })
  nivel?: NivelCargo;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser um valor booleano' })
  ativo?: boolean;
}
