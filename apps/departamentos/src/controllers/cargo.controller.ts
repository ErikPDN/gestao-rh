import { CreateCargoDto, UpdateCargoDto } from '@app/contracts';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CargoService } from '../services/cargo.service.js';

@Controller('departamentos/:departamentoId/cargos')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post()
  createCargo(
    @Param('departamentoId') departamentoId: string,
    @Body() createCargoDto: CreateCargoDto,
  ) {
    return this.cargoService.createCargo(departamentoId, createCargoDto);
  }

  @Get()
  getAllCargos(@Param('departamentoId') departamentoId: string) {
    return this.cargoService.listCargos(departamentoId);
  }

  @Get(':cargoId')
  getCargos(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string,
  ) {
    return this.cargoService.getCargo(departamentoId, cargoId);
  }

  @Patch(':cargoId')
  updateCargo(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string,
    @Body() updateCargoDto: UpdateCargoDto,
  ) {
    return this.cargoService.updateCargo(
      departamentoId,
      cargoId,
      updateCargoDto,
    );
  }

  @Post(':cargoId/desativar')
  desativarCargo(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string,
  ) {
    return this.cargoService.desativarCargo(departamentoId, cargoId);
  }
}
