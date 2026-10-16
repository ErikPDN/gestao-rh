import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GrpcExceptionFilter, JwtAuthGuard, RolesGuard } from '@app/common';
import { FuncionarioModule } from './funcionarios-service/funcionario-service.module.js';
import { DepartamentoModule } from './departamentos-service/departamento.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AuthenticationModule } from './authentication-service/authentication-service.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/api-gateway/.env', '.env'],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: Buffer.from(
          config.getOrThrow<string>('JWT_PUBLIC_KEY_BASE64'),
          'base64',
        ).toString('utf-8'),
        verifyOptions: { algorithms: ['RS256'] },
      }),
    }),
    AuthenticationModule,
    FuncionarioModule,
    DepartamentoModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GrpcExceptionFilter },
  ],
})
export class AppModule {}
