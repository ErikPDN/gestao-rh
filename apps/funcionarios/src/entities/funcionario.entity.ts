import {
  Column,
  CreateDateColumn,
  Entity,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('funcionario')
export class Funcionario {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'cpf_cnpj', type: 'varchar', unique: true, length: 14 })
  cpfCnpj!: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome!: string;

  @Column({ name: 'departamento_id', type: 'uuid' })
  departamentoId!: string;

  @Column({ name: 'cargo_id', type: 'uuid' })
  cargoId!: string;

  @Column({ name: 'salario', type: 'decimal', precision: 10, scale: 2 })
  salario!: number;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento!: Date;

  @Column({ name: 'data_admissao', type: 'date' })
  dataAdmissao!: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @CreateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;
}
