import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDepartamentoDto {
  @IsString({ message: 'O nome do departamento deve ser uma string' })
  @MinLength(3, {
    message: 'O nome do departamento deve ter no mínimo 3 caracteres',
  })
  @MaxLength(255, {
    message: 'O nome do departamento deve ter no máximo 255 caracteres',
  })
  nome!: string;

  @IsOptional()
  @IsString({ message: 'A descrição do departamento deve ser uma string' })
  @MaxLength(500, {
    message: 'A descrição do departamento deve ter no máximo 500 caracteres',
  })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O ID do gestor deve ser um UUID válido' })
  gestorId?: string;

  @IsBoolean({ message: 'O campo ativo deve ser um valor booleano' })
  ativo: boolean;
}
