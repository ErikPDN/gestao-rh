import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Funcionario } from './entities/funcionario.entity.js';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateFuncionarioDto,
  FuncionarioResponse,
  UpdateFuncionarioDto,
  GetFuncionariosQueryDto,
} from '@app/contracts';
import { DepartamentoClientService } from './departamento-client/departamento-client.service.js';

@Injectable()
export class FuncionarioService {
  constructor(
    @InjectRepository(Funcionario)
    private funcionarioRepository: Repository<Funcionario>,
    private readonly departamentoClient: DepartamentoClientService,
  ) { }

  async getFuncionarios(
    query: GetFuncionariosQueryDto,
  ) {
    const { funcionarioIds, page, limit } = query;
    const isIdLookup = !!funcionarioIds?.length;

    const [funcionarios, total] = await this.funcionarioRepository.findAndCount({
      where: isIdLookup ? { id: In(funcionarioIds) } : {},
      ...(isIdLookup ? {} : { skip: (page - 1) * limit, take: limit }),
    })

    const departamentosIds = [
      ...new Set(funcionarios.map((f) => f.departamentoId)),
    ];
    const cargosIds = [...new Set(funcionarios.map((f) => f.cargoId))];

    const [departamentos, cargos] = await Promise.all([
      this.departamentoClient.getDepartamentos(departamentosIds),
      this.departamentoClient.getCargos(cargosIds),
    ]);

    const departamentoPorId = new Map(departamentos.map((d) => [d.id, d]));
    const cargoPorId = new Map(cargos.map((c) => [c.id, c]));

    return {
      data: funcionarios.map((f) =>
        this.toFuncionarioResponse(
          f,
          departamentoPorId.get(f.departamentoId)?.nome ?? '',
          cargoPorId.get(f.cargoId)?.nome ?? '',
        ),
      ),
      total,
      page: isIdLookup ? 1 : page,
      limit: isIdLookup ? total : limit,
    }
  }

  async getFuncionario(id: string): Promise<FuncionarioResponse> {
    const funcionario = await this.funcionarioRepository.findOne({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionário com id ${id} não encontrado`);
    }

    const [departamento, cargo] = await Promise.all([
      this.departamentoClient.getDepartamento(funcionario.departamentoId),
      this.departamentoClient.getCargo(
        funcionario.cargoId,
        funcionario.departamentoId,
      ),
    ]);

    return this.toFuncionarioResponse(
      funcionario,
      departamento?.nome ?? '',
      cargo?.nome ?? '',
    );
  }

  async createFuncionario(
    dto: CreateFuncionarioDto,
  ): Promise<FuncionarioResponse> {
    const funcionarioExistente = await this.funcionarioRepository.findOne({
      where: { cpfCnpj: dto.cpfCnpj },
    });

    if (funcionarioExistente) {
      throw new ConflictException('Funcionário com este CPF/CNPJ já existe');
    }

    const [departamento, cargo] = await Promise.all([
      this.departamentoClient.getDepartamento(dto.departamentoId),
      this.departamentoClient.getCargo(dto.cargoId, dto.departamentoId),
    ]);

    if (!departamento) {
      throw new NotFoundException(
        `Departamento com id ${dto.departamentoId} não encontrado`,
      );
    }

    if (!cargo) {
      throw new NotFoundException(
        `Cargo com id ${dto.cargoId} não encontrado no departamento ${dto.departamentoId}`,
      );
    }

    if (dto.salario < cargo.salarioBase || dto.salario > cargo.salarioTeto) {
      throw new BadRequestException(
        `O salário do funcionário deve estar entre ${cargo.salarioBase} e ${cargo.salarioTeto}`,
      );
    }

    const funcionario = this.funcionarioRepository.create({
      id: crypto.randomUUID(),
      cpfCnpj: dto.cpfCnpj,
      nome: dto.nome,
      departamentoId: dto.departamentoId,
      cargoId: dto.cargoId,
      salario: dto.salario,
      dataNascimento: dto.dataNascimento,
      dataAdmissao: dto.dataAdmissao ? dto.dataAdmissao : new Date(),
    });

    const funcionarioSalvo = await this.funcionarioRepository.save(funcionario);

    return this.toFuncionarioResponse(
      funcionarioSalvo,
      departamento.nome,
      cargo.nome,
    );
  }

  async updateFuncionario(
    id: string,
    dto: UpdateFuncionarioDto,
  ): Promise<FuncionarioResponse> {
    const funcionario = await this.funcionarioRepository.findOne({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionário com id ${id} não encontrado`);
    }

    const departamentoId = dto.departamentoId ?? funcionario.departamentoId;
    const cargoId = dto.cargoId ?? funcionario.cargoId;
    const salario = dto.salario ?? Number(funcionario.salario);

    const [departamento, cargo] = await Promise.all([
      this.departamentoClient.getDepartamento(departamentoId),
      this.departamentoClient.getCargo(cargoId, departamentoId),
    ]);

    const vinculoAlterado =
      dto.departamentoId !== undefined ||
      dto.cargoId !== undefined ||
      dto.salario !== undefined;

    if (
      vinculoAlterado &&
      (salario < cargo.salarioBase || salario > cargo.salarioTeto)
    ) {
      throw new BadRequestException(
        `O salário do funcionário deve estar entre ${cargo.salarioBase} e ${cargo.salarioTeto}`,
      );
    }

    funcionario.nome = dto.nome ?? funcionario.nome;
    funcionario.dataNascimento =
      dto.dataNascimento ?? funcionario.dataNascimento;
    funcionario.departamentoId = departamentoId;
    funcionario.cargoId = cargoId;
    funcionario.salario = salario;

    const funcionarioSalvo = await this.funcionarioRepository.save(funcionario);

    return this.toFuncionarioResponse(
      funcionarioSalvo,
      departamento.nome,
      cargo.nome,
    );
  }

  async demitirFuncionario(id: string): Promise<FuncionarioResponse> {
    const funcionario = await this.funcionarioRepository.findOne({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionário com id ${id} não encontrado`);
    }

    this.funcionarioRepository.merge(funcionario, { dataDemissao: new Date() });
    const funcionarioSalvo = await this.funcionarioRepository.save(funcionario);

    const [departamento, cargo] = await Promise.all([
      this.departamentoClient.getDepartamento(funcionarioSalvo.departamentoId),
      this.departamentoClient.getCargo(
        funcionarioSalvo.cargoId,
        funcionarioSalvo.departamentoId,
      ),
    ]);

    return this.toFuncionarioResponse(
      funcionarioSalvo,
      departamento?.nome ?? '',
      cargo?.nome ?? '',
    );
  }

  private toFuncionarioResponse(
    funcionario: Funcionario,
    departamentoNome: string,
    cargoNome: string,
  ): FuncionarioResponse {
    return {
      id: funcionario.id,
      cpfCnpj: funcionario.cpfCnpj,
      nome: funcionario.nome,
      departamento: departamentoNome,
      cargo: cargoNome,
      salario: funcionario.salario,
      dataNascimento: funcionario.dataNascimento,
      dataAdmissao: funcionario.dataAdmissao,
      dataDemissao: funcionario.dataDemissao,
    };
  }
}
