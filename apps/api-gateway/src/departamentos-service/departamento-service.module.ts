import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DepartamentoController } from './departamento-service.controller.js';
import { DepartamentoService } from './departamento-service.service.js';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [DepartamentoController],
  providers: [
    DepartamentoService,
    {
      provide: 'DEPARTAMENTO_SERVICE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('DEPARTAMENTO_SERVICE_URL'),
      inject: [ConfigService],
    }
  ]
})
export class DepartamentoModule { }
