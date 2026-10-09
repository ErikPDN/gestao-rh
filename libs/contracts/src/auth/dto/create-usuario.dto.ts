import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum.js';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  email!: string;

  @IsString({ message: 'A senha fornecida não é válida.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @MaxLength(255, { message: 'A senha deve ter no máximo 255 caracteres.' })
  senha!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Role, {
    each: true,
    message: 'Os papéis fornecidos não são válidos.',
  })
  roles!: Role[];

  @IsUUID('4', { message: 'O ID do funcionário fornecido não é válido.' })
  funcionarioId!: string;
}
