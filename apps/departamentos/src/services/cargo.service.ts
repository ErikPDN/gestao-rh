import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cargo } from '../entities/cargo.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CargoResult, CreateCargoDto, UpdateCargoDto } from '@app/contracts';
import { Departamento } from '../entities/departamento.entity.js';
import { In } from 'typeorm/find-options/operator/In.js';

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
    @InjectRepository(Departamento)
    private departamentoRepository: Repository<Departamento>,
  ) {}

  async createCargo(
    idDepartamento: string,
    dto: CreateCargoDto,
  ): Promise<CargoResult> {
    const existeDepartamento = await this.departamentoRepository.findOne({
      where: { id: idDepartamento },
    });

    if (!existeDepartamento) {
      throw new NotFoundException(
        `Departamento com id ${idDepartamento} não encontrado`,
      );
    }

    const cargoExistente = await this.cargoRepository.findOne({
      where: { nome: dto.nome, departamentoId: idDepartamento },
    });

    if (cargoExistente) {
      throw new ConflictException(
        `Cargo com nome ${dto.nome} já existe neste departamento`,
      );
    }

    const novoCargo = this.cargoRepository.create({
      id: crypto.randomUUID(),
      nome: dto.nome,
      salarioBase: dto.salarioBase,
      salarioTeto: dto.salarioTeto,
      departamentoId: idDepartamento,
      nivel: dto.nivel,
      ativo: dto.ativo ?? true,
    });

    const cargoSalvo = await this.cargoRepository.save(novoCargo);

    return this.toCargoResult(cargoSalvo);
  }

  async getCargo(
    idDepartamento: string,
    idCargo: string,
  ): Promise<CargoResult> {
    const cargo = await this.cargoRepository.findOne({
      where: { id: idCargo, departamentoId: idDepartamento },
    });

    if (!cargo) {
      throw new NotFoundException(
        `Cargo com id ${idCargo} não encontrado no departamento ${idDepartamento}`,
      );
    }

    return this.toCargoResult(cargo);
  }

  async getCargos(ids: string[]): Promise<CargoResult[]> {
    if (ids.length === 0) return [];

    const cargos = await this.cargoRepository.find({
      where: { id: In(ids) },
    });

    return cargos.map((cargo) => this.toCargoResult(cargo));
  }

  async listCargos(idDepartamento: string): Promise<CargoResult[]> {
    const cargos = await this.cargoRepository.find({
      where: { departamentoId: idDepartamento },
    });

    return cargos.map((cargo) => this.toCargoResult(cargo));
  }

  async updateCargo(
    departamentoId: string,
    cargoId: string,
    dto: UpdateCargoDto,
  ): Promise<CargoResult> {
    const cargo = await this.cargoRepository.findOne({
      where: { id: cargoId, departamentoId: departamentoId },
    });

    if (!cargo) {
      throw new NotFoundException(
        `Cargo com id ${cargoId} não encontrado no departamento ${departamentoId}`,
      );
    }

    if (dto.nome) {
      const cargoExistente = await this.cargoRepository.findOne({
        where: { nome: dto.nome, departamentoId: departamentoId },
      });

      if (cargoExistente && cargoExistente.id !== cargoId) {
        throw new ConflictException(
          `Cargo com nome ${dto.nome} já existe neste departamento`,
        );
      }
    }

    Object.assign(cargo, dto);
    const cargoSalvo = await this.cargoRepository.save(cargo);

    return this.toCargoResult(cargoSalvo);
  }

  async desativarCargo(
    departamentoId: string,
    cargoId: string,
  ): Promise<CargoResult> {
    const cargo = await this.cargoRepository.findOne({
      where: { id: cargoId, departamentoId: departamentoId },
    });

    if (!cargo) {
      throw new NotFoundException(
        `Cargo com id ${cargoId} não encontrado no departamento ${departamentoId}`,
      );
    }

    if (!cargo.ativo) {
      throw new BadRequestException(
        `Cargo com id ${cargoId} já está desativado`,
      );
    }

    this.cargoRepository.merge(cargo, { ativo: false });
    await this.cargoRepository.save(cargo);

    return this.toCargoResult(cargo);
  }

  private toCargoResult(cargo: Cargo): CargoResult {
    return {
      id: cargo.id,
      nome: cargo.nome,
      departamentoId: cargo.departamentoId,
      salarioBase: Number(cargo.salarioBase),
      salarioTeto: Number(cargo.salarioTeto),
      nivel: cargo.nivel,
      createdAt: cargo.createdAt,
      updatedAt: cargo.updatedAt,
      ativo: cargo.ativo,
    };
  }
}
