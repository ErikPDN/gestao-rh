import { Injectable } from '@nestjs/common';
import { Funcionario } from './entities/funcionario.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FuncionarioResponse } from '@app/contracts';

@Injectable()
export class FuncionarioService {
  constructor(
    @InjectRepository(Funcionario)
    private userRepository: Repository<Funcionario>,
  ) {}

  async findAll(): Promise<FuncionarioResponse[]> {}

  async findOne(id: string): Promise<FuncionarioResponse> {}

  async create(dto: CreateFuncionarioDto): Promise<void> {}

  async update(id: string, dto: UpdateFuncionarioDto): Promise<void> {}
}
