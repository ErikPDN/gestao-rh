import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;


  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
