import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Funcionario } from '../entities/funcionario.entity.js';

dotenv.config({ path: './apps/funcionarios/.env' });

export default new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME_FUNCIONARIO,
  password: process.env.DB_PASSWORD_FUNCIONARIO,
  host: process.env.DB_HOST_FUNCIONARIO,
  port: Number(process.env.DB_PORT_FUNCIONARIO),
  database: process.env.DB_FUNCIONARIO,
  entities: [Funcionario],
  migrations: ['apps/funcionarios/src/database/migrations/*.ts'],
  synchronize: false,
});
