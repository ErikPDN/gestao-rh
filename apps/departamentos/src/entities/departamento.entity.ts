import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('departamento')
export class Departamento {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'nome', type: 'varchar', length: 255, unique: true })
  nome!: string;

  @Column({ name: 'descricao', type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column({ name: 'gestor_id', type: 'uuid', nullable: true })
  gestorId?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ name: 'ativo', type: 'boolean', default: true })
  ativo: boolean;
}
