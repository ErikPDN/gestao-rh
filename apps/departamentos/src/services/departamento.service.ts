import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from '../entities/departamento.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { DepartamentoResult } from '@app/contracts/departamentos/interfaces/departamento-result.interface.js';
import {
  CreateDepartamentoDto,
  DepartamentoDashboardResult,
  GetDepartamentosQueryDto,
  StatusDepartamento,
  UpdateDepartamentoDto,
} from '@app/contracts';
import { In } from 'typeorm/find-options/operator/In.js';
import { FuncionarioClientService } from '../funcionario-client/funcionario-client.service.js';
import { Cargo } from '../entities/cargo.entity.js';
import { ILike } from 'typeorm';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private departamentoRepository: Repository<Departamento>,
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
    private readonly funcionarioClient: FuncionarioClientService,
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

    const gestorExistente = dto.gestorId
      ? await this.funcionarioClient.getFuncionario(dto.gestorId)
      : null;

    if (dto.gestorId && !gestorExistente) {
      throw new NotFoundException(
        `Gestor com ID ${dto.gestorId} não encontrado`,
      );
    }

    if (dto.gestorId && gestorExistente?.dataDemissao) {
      throw new BadRequestException(
        `Gestor com ID ${dto.gestorId} está desligado e não pode ser atribuído como gestor`,
      );
    }

    const departamento = this.departamentoRepository.create({
      id: crypto.randomUUID(),
      nome: dto.nome,
      descricao: dto.descricao,
      gestorId: dto.gestorId,
      gestorNome: gestorExistente ? gestorExistente.nome : undefined,
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

  async getDepartamentos(filtro: GetDepartamentosQueryDto) {
    const { departamentoIds, page = 1, limit = 20, query, status } = filtro;
    const isIdLookup = !!departamentoIds?.length;

    const statusWhere =
      status === StatusDepartamento.ATIVO
        ? { ativo: true }
        : status === StatusDepartamento.INATIVO
          ? { ativo: false }
          : {};

    const where = isIdLookup
      ? { id: In(departamentoIds), ...statusWhere }
      : query
        ? [
            { nome: ILike(`%${query}%`), ...statusWhere },
            { gestorNome: ILike(`%${query}%`), ...statusWhere },
          ]
        : statusWhere;

    const [departamentos, total] =
      await this.departamentoRepository.findAndCount({
        where,
        ...(isIdLookup ? {} : { skip: (page - 1) * limit, take: limit }),
      });

    const cargosAtivosMap = await this.contarCargosAtivos(
      departamentos.map((d) => d.id),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: departamentos.map((departamento) =>
        this.toDepartamentoResult(
          departamento,
          cargosAtivosMap.get(departamento.id) ?? 0,
        ),
      ),
      total,
      page: isIdLookup ? 1 : page,
      limit: isIdLookup ? total : limit,
      totalPages,
    };
  }

  async getDashboard(): Promise<DepartamentoDashboardResult> {
    const [ativos, totalCadastrados, cargosAtivos] = await Promise.all([
      this.departamentoRepository.count({ where: { ativo: true } }),
      this.departamentoRepository.count(),
      this.cargoRepository.count({ where: { ativo: true } }),
    ]);

    return {
      ativos,
      totalCadastrados,
      cargosAtivos,
    };
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

    const gestorExistente = dto.gestorId
      ? await this.funcionarioClient.getFuncionario(dto.gestorId)
      : null;

    if (dto.gestorId) {
      if (!gestorExistente)
        throw new NotFoundException(
          `Gestor com ID ${dto.gestorId} não encontrado`,
        );

      if (gestorExistente.departamentoId !== id) {
        throw new BadRequestException(
          `Gestor com ID ${dto.gestorId} não pertence ao departamento com ID ${id}`,
        );
      }

      if (gestorExistente.dataDemissao) {
        throw new BadRequestException(
          `Gestor com ID ${dto.gestorId} está desligado e não pode ser atribuído como gestor`,
        );
      }

      departamento.gestorNome = gestorExistente.nome;
    } else if (dto.gestorId === null) {
      departamento.gestorNome = undefined;
    }

    Object.assign(departamento, dto);
    const departamentoSalvo =
      await this.departamentoRepository.save(departamento);

    return this.toDepartamentoResult(departamentoSalvo);
  }

  async removerGestor(funcionarioId: string): Promise<number> {
    const result = await this.departamentoRepository.update(
      { gestorId: funcionarioId },
      { gestorId: () => 'NULL', gestorNome: () => 'NULL' },
    );

    return result.affected ?? 0;
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

  private async contarCargosAtivos(
    departamentoIds: string[],
  ): Promise<Map<string, number>> {
    if (departamentoIds.length === 0) {
      return new Map();
    }

    const rows = await this.cargoRepository
      .createQueryBuilder('cargo')
      .select('cargo.departamento_id', 'departamentoId')
      .addSelect('COUNT(*)', 'total')
      .where('cargo.departamento_id IN (:...departamentoIds)', {
        departamentoIds,
      })
      .andWhere('cargo.ativo = true')
      .groupBy('cargo.departamento_id')
      .getRawMany<{ departamentoId: string; total: number }>();

    return new Map(rows.map((row) => [row.departamentoId, Number(row.total)]));
  }

  private toDepartamentoResult(
    departamento: Departamento,
    totalCargos?: number,
  ): DepartamentoResult {
    return {
      id: departamento.id,
      nome: departamento.nome,
      descricao: departamento.descricao,
      gestorId: departamento.gestorId,
      gestorNome: departamento.gestorNome,
      totalCargos: totalCargos,
      createdAt: departamento.createdAt,
      updatedAt: departamento.updatedAt,
      ativo: departamento.ativo,
    };
  }
}
