import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from '../entities/departamento.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { Cargo } from '../entities/cargo.entity.js';
import { DepartamentoResult } from '@app/contracts/departamentos/interfaces/departamento-result.interface.js';
import { CreateDepartamentoDto, UpdateDepartamentoDto } from '@app/contracts';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private departamentoRepository: Repository<Departamento>,
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
  ) {}

  async createDepartamento(
    dto: CreateDepartamentoDto,
  ): Promise<DepartamentoResult> {
    const departamentoExistente = await this.departamentoRepository.findOne({
      where: { nome: dto.nome },
    });

    if (departamentoExistente) {
      throw new ConflictException('Departamento com esse nome já existe');
    }

    const departamento = this.departamentoRepository.create({
      id: crypto.randomUUID(),
      nome: dto.nome,
      descricao: dto.descricao,
      gestorId: dto.gestorId,
      ativo: dto.ativo,
    });

    const departamentoSalvo =
      await this.departamentoRepository.save(departamento);

    return this.toDepartamentoResult(departamentoSalvo);
  }

  async getDepartamento(id: string): Promise<DepartamentoResult> {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
    });

    if (!departamento)
      throw new NotFoundException(`Departamento com id ${id} não encontrado`);

    return this.toDepartamentoResult(departamento);
  }

  async updateDepartamento(
    id: string,
    dto: UpdateDepartamentoDto,
  ): Promise<DepartamentoResult> {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
    });

    if (!departamento)
      throw new NotFoundException(`Departamento com id ${id} não encontrado`);

    Object.assign(departamento, dto);
    const departamentoSalvo =
      await this.departamentoRepository.save(departamento);

    return this.toDepartamentoResult(departamentoSalvo);
  }

  async desativarDepartamento(id: string): Promise<DepartamentoResult> {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
    });

    if (!departamento)
      throw new NotFoundException(`Departamento com id ${id} não encontrado`);

    const isAtivo = departamento.ativo;

    if (!isAtivo) {
      throw new BadRequestException(
        `Departamento com id ${id} já está inativo`,
      );
    }

    this.departamentoRepository.merge(departamento, { ativo: false });
    const departamentoDesativado =
      await this.departamentoRepository.save(departamento);

    return this.toDepartamentoResult(departamentoDesativado);
  }

  private toDepartamentoResult(departamento: Departamento): DepartamentoResult {
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
