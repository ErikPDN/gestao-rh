import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('departamento')
export class Departamento {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome!: string;

  @Column({ name: 'descricao', type: 'varchar', length: 500, nullable: true })
  descricao?: string;

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
