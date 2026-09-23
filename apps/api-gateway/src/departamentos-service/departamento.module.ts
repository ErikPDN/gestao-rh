import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DepartamentoController } from './departamento.controller.js';
import { DepartamentoService } from './departamento.service.js';
import { ConfigService } from '@nestjs/config';
import { CargoController } from './cargo.controller.js';
import { CargoService } from './cargo.service.js';

@Module({
  imports: [HttpModule],
  controllers: [DepartamentoController, CargoController],
  providers: [
    DepartamentoService,
    CargoService,
    {
      provide: 'DEPARTAMENTO_SERVICE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('DEPARTAMENTO_SERVICE_URL'),
      inject: [ConfigService],
    }
  ]
})
export class DepartamentoModule { }
