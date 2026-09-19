import { CreateDepartamentoDto } from './create-departamento.dto.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDepartamentoDto extends PartialType(CreateDepartamentoDto) {}
