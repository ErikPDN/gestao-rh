import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoDto } from '../index.js';

export class UpdateCargoDto extends PartialType(CreateCargoDto) {}
