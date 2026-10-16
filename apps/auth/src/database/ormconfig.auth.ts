import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

dotenv.config({ path: './apps/auth/.env' });

export const AuthenticationDatabase: TypeOrmModuleOptions = {
  type: 'postgres',
  username: process.env.DB_USERNAME_AUTH,
  password: process.env.DB_PASSWORD_AUTH,
  host: process.env.DB_HOST_AUTH,
  port: Number(process.env.DB_PORT_AUTH),
  database: process.env.DB_AUTH,
  dropSchema: false,
  cache: false,
  synchronize: false,
  logging: false,
  extra: {
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  },
  entities: [Usuario, RefreshToken],
};
