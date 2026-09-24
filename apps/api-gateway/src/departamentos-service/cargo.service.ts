import { CargoResult, CreateCargoDto, UpdateCargoDto } from "@app/contracts";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { firstValueFrom, OperatorFunction, catchError } from "rxjs";

@Injectable()
export class CargoService {
  private readonly logger = new Logger(CargoService.name);

  constructor(
    @Inject('DEPARTAMENTO_SERVICE_URL') private readonly apiUrl: string,
    private readonly httpService: HttpService
  ) { }

  async createCargo(departamentoId: string, dto: CreateCargoDto): Promise<CargoResult> {
    const response = await firstValueFrom(
      this.httpService
        .post(`${this.apiUrl}/departamentos/${departamentoId}/cargos/`, dto)
        .pipe(this.handleError('Error creating cargo'))
    )

    return response.data;
  }

  async getAllCargos(departamentoId: string): Promise<CargoResult[]> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.apiUrl}/departamentos/${departamentoId}/cargos/`)
        .pipe(this.handleError('Error fetching cargos'))
    )

    return response.data;
  }

  async getCargo(departamentoId: string, cargoId: string): Promise<CargoResult> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.apiUrl}/departamentos/${departamentoId}/cargos/${cargoId}`)
        .pipe(this.handleError('Error fetching cargo'))
    )

    return response.data;
  }


  async updateCargo(departamentoId: string, cargoId: string, dto: UpdateCargoDto): Promise<CargoResult> {
    const response = await firstValueFrom(
      this.httpService
        .patch(`${this.apiUrl}/departamentos/${departamentoId}/cargos/${cargoId}`, dto)
        .pipe(this.handleError('Error updating cargo'))
    )

    return response.data;
  }

  async desativarCargo(departamentoId: string, cargoId: string): Promise<CargoResult> {
    const response = await firstValueFrom(
      this.httpService
        .post(`${this.apiUrl}/departamentos/${departamentoId}/cargos/${cargoId}/desativar`)
        .pipe(this.handleError('Error deactivating cargo'))
    )

    return response.data;
  }

  private handleError<T>(context: string): OperatorFunction<T, T> {
    return catchError((error: AxiosError<any>) => {
      this.logger.error(`${context}: ${error.message}`, error.stack);
      throw new HttpException(
        error.response?.data ?? 'Internal Server Error',
        error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  }

}
