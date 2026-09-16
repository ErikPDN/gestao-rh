import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Cargo } from '../entities/cargo.entity.js';
import { Departamento } from '../entities/departamento.entity.js';

dotenv.config({ path: './apps/departamentos/.env' });

export default new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME_DEPARTAMENTO,
  password: process.env.DB_PASSWORD_DEPARTAMENTO,
  host: process.env.DB_HOST_DEPARTAMENTO,
  port: Number(process.env.DB_PORT_DEPARTAMENTO),
  database: process.env.DB_DEPARTAMENTO,
  entities: [Departamento, Cargo],
  migrations: ['apps/departamentos/src/database/migrations/*.ts'],
  synchronize: false,
});
