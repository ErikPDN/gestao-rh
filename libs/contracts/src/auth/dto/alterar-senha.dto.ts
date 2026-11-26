import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @IsNotEmpty({ message: 'O campo senhaAtual é obrigatório' })
  @IsString({ message: 'O campo senhaAtual deve ser uma string' })
  @MaxLength(255, {
    message: 'O campo senhaAtual deve ter no máximo 255 caracteres',
  })
  senhaAtual!: string;

  @IsNotEmpty({ message: 'O campo senhaNova é obrigatório' })
  @IsString({ message: 'O campo senhaNova deve ser uma string' })
  @MinLength(6, {
    message: 'O campo senhaNova deve ter no mínimo 6 caracteres',
  })
  @MaxLength(255, {
    message: 'O campo senhaNova deve ter no máximo 255 caracteres',
  })
  senhaNova!: string;
}
