import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { NivelCargo } from '../../../../libs/contracts/src/departamentos/enums/nivel-cargo.enum.js';

@Index(['departamentoId', 'nome'], { unique: true })
@Entity('cargo')
export class Cargo {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome!: string;

  @Column({
    name: 'salario_base',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  salarioBase!: number;

  @Column({
    name: 'salario_teto',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  salarioTeto!: number;

  @Column({ name: 'departamento_id', type: 'uuid' })
  departamentoId!: string;

  @Column({
    name: 'nivel',
    type: 'enum',
    enum: NivelCargo,
    nullable: true,
  })
  nivel?: NivelCargo;

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

  @Column({ name: 'ativo', type: 'boolean', default: true })
  ativo: boolean;
}
