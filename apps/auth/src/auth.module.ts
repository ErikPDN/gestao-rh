import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.grpc.controller.js';
import { AuthService } from './services/auth.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationDatabase } from './database/ormconfig.auth.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Usuario } from './entities/usuario.entity.js';
import { TokenService } from './services/token.service.js';
import { JwtModule } from '@nestjs/jwt';
import { FuncionarioClientModule } from './funcionario-client/funcionario-client.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/auth/.env', '.env'],
    }),
    TypeOrmModule.forRoot({ ...AuthenticationDatabase }),
    TypeOrmModule.forFeature([Usuario, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: Buffer.from(
          config.getOrThrow('JWT_PRIVATE_KEY_BASE64'),
          'base64',
        ).toString('utf-8'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: Number(config.getOrThrow('JWT_ACCESS_TTL')),
        },
      }),
    }),
    FuncionarioClientModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
