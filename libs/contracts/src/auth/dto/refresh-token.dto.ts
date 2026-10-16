import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'O refresh token fornecido não é válido.' })
  @IsNotEmpty({ message: 'O refresh token não pode estar vazio.' })
  refreshToken!: string;
}
