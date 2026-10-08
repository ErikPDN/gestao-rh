import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { StatusDepartamento } from '../enums/status-departamento.enum.js';

export class GetDepartamentosQueryDto {
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
    message: 'Todos os ids devem ser UUIDs válidos',
  })
  departamentoIds?: string[];

  @IsOptional()
  @IsString({ message: 'A query deve ser uma string' })
  query?: string;

  @IsOptional()
  @IsEnum(StatusDepartamento, {
    message: 'Status inválido. Deve ser ATIVO ou INATIVO',
  })
  status?: StatusDepartamento;

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
