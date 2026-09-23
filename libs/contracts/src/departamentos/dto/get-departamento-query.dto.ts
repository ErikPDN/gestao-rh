import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetDepartamentosQueryDto {
  @Transform(({ value }) =>
    value == null
      ? []
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
  departamentoIds: string[];
}
