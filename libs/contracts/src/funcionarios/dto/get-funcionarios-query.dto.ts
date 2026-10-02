import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatusFuncionario } from '../types/status-funcionario.enum.js';

export class GetFuncionariosQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value == null
      ? undefined
      : Array.isArray(value)
        ? value
        : String(value).split(','),
  )
  @IsArray()
  @ArrayMaxSize(100, { message: 'Máximo de 100 ids por query' })
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
    message: 'Todos os ids de funcionarios ter um id válido',
  })
  funcionarioIds?: string[];

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(StatusFuncionario, {
    message: 'Status inválido. Deve ser ATIVO ou DESLIGADO',
  })
  status?: StatusFuncionario;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
