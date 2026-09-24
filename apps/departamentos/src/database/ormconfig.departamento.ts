import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Cargo } from '../entities/cargo.entity.js';
import { Departamento } from '../entities/departamento.entity.js';

dotenv.config({ path: './apps/departamentos/.env' });

export const DepartamentoDatabase: TypeOrmModuleOptions = {
  type: 'postgres',
  username: process.env.DB_USERNAME_DEPARTAMENTO,
  password: process.env.DB_PASSWORD_DEPARTAMENTO,
  host: process.env.DB_HOST_DEPARTAMENTO,
  port: Number(process.env.DB_PORT_DEPARTAMENTO),
  database: process.env.DB_DEPARTAMENTO,
  dropSchema: false,
  cache: false,
  synchronize: false,
  logging: false,
  extra: {
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  },
  entities: [Departamento, Cargo],
};
