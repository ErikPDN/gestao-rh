import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateFuncionarioDto } from './create-funcionario.dto.js';

export class UpdateFuncionarioDto extends PartialType(
  OmitType(CreateFuncionarioDto, ['cpfCnpj', 'dataAdmissao'] as const),
) {}
