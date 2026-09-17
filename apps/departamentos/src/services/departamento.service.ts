import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from '../entities/departamento.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { Cargo } from '../entities/cargo.entity.js';
import { DepartamentoResult } from '@app/contracts/departamentos/interfaces/departamento-result.interface.js';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private departamentoRepository: Repository<Departamento>,
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
  ) {}

  async getDepartamento(id: string): Promise<DepartamentoResult> {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
    });

    if (!departamento)
      throw new NotFoundException(`Departamento com id ${id} não encontrado`);

    return {
      id: departamento.id,
      nome: departamento.nome,
      descricao: departamento.descricao,
      gestorId: departamento.gestorId,
      createdAt: departamento.createdAt,
      updatedAt: departamento.updatedAt,
      ativo: departamento.ativo,
    };
  }
}
