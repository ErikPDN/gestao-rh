import { Module } from '@nestjs/common';
import { FuncionarioController } from './funcionario-service.controller.js';
import { FuncionarioService } from './funcionario-service.service.js';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [FuncionarioController],
  providers: [
    FuncionarioService,
    {
      provide: 'FUNCIONARIO_SERVICE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('FUNCIONARIO_SERVICE_URL'),
      inject: [ConfigService],
    }
  ],
})
export class FuncionarioModule { }
