import { Role } from '../../../../libs/contracts/src/auth/enums/role.enum.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  senhaHash!: string;

  @Column({ name: 'roles', type: 'enum', enum: Role, array: true })
  roles!: Role[];

  @Column({
    name: 'funcionario_id',
    type: 'uuid',
    nullable: true,
    unique: true,
  })
  funcionarioId!: string | null;

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
  ativo!: boolean;
}
