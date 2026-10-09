import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  email!: string;

  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsString({ message: 'A senha fornecida não é válida.' })
  @MaxLength(255, { message: 'A senha deve ter no máximo 255 caracteres.' })
  senha!: string;
}
