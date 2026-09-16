import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Funcionario } from '../entities/funcionario.entity.js';

dotenv.config({ path: './apps/funcionarios/.env' });

export const FuncionarioDatabase: TypeOrmModuleOptions = {
  name: 'funcionario',
  type: 'postgres',
  username: process.env.DB_USERNAME_FUNCIONARIO,
  password: process.env.DB_PASSWORD_FUNCIONARIO,
  host: process.env.DB_HOST_FUNCIONARIO,
  port: Number(process.env.DB_PORT_FUNCIONARIO),
  database: process.env.DB_FUNCIONARIO,
  dropSchema: false,
  cache: false,
  synchronize: false,
  logging: false,
  extra: {
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  },
  entities: [Funcionario],
};
