import { Controller, Param, Post, Body, Get, Patch } from "@nestjs/common";
import { CargoService } from "./cargo.service.js";
import { CargoResult, CreateCargoDto, UpdateCargoDto } from "@app/contracts";

@Controller('departamentos/:departamentoId/cargos')
export class CargoController {
  constructor(private readonly cargoService: CargoService) { }

  @Post()
  createCargo(
    @Param('departamentoId') departamentoId: string,
    @Body() createCargoDto: CreateCargoDto
  ): Promise<CargoResult> {
    return this.cargoService.createCargo(departamentoId, createCargoDto);
  }

  @Get()
  getAllCargos(
    @Param('departamentoId') departamentoId: string
  ): Promise<CargoResult[]> {
    return this.cargoService.getAllCargos(departamentoId);
  }

  @Get(':cargoId')
  getCargo(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string
  ): Promise<CargoResult> {
    return this.cargoService.getCargo(departamentoId, cargoId);
  }

  @Patch()
  updateCargo(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string,
    @Body() updateCargoDto: UpdateCargoDto
  ): Promise<CargoResult> {
    return this.cargoService.updateCargo(departamentoId, cargoId, updateCargoDto);
  }

  @Post(':cargoId/desativar')
  desativarCargo(
    @Param('departamentoId') departamentoId: string,
    @Param('cargoId') cargoId: string
  ) {
    return this.cargoService.desativarCargo(departamentoId, cargoId);
  }
}
