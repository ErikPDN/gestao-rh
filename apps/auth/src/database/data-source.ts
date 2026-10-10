import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

dotenv.config({ path: './apps/auth/.env' });

export default new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME_AUTH,
  password: process.env.DB_PASSWORD_AUTH,
  host: process.env.DB_HOST_AUTH,
  port: Number(process.env.DB_PORT_AUTH),
  database: process.env.DB_AUTH,
  entities: [Usuario, RefreshToken],
  migrations: ['apps/auth/src/database/migrations/*.ts'],
  synchronize: false,
});
