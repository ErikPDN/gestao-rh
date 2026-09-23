import { CreateDepartamentoDto, DepartamentoResult, UpdateDepartamentoDto } from "@app/contracts";
import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { catchError, firstValueFrom, OperatorFunction } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";

@Injectable()
export class DepartamentoService {
  private readonly logger = new Logger(DepartamentoService.name);

  constructor(
    @Inject('DEPARTAMENTO_SERVICE_URL') private readonly apiUrl: string,
    private readonly httpService: HttpService
  ) { }

  async createDepartamento(dto: CreateDepartamentoDto) {
    const response = await firstValueFrom(
      this.httpService
        .post<DepartamentoResult>(`${this.apiUrl}/departamentos`, dto)
        .pipe(this.handleError('Error creating departamento'))
    )

    return response.data;
  }

  async getDepartamento(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<DepartamentoResult>(`${this.apiUrl}/departamentos/${id}`)
        .pipe(this.handleError('Error fetching departamento'))
    )

    return response.data;
  }

  async getDepartamentos(departamentoIds: string[]) {
    const response = await firstValueFrom(
      this.httpService
        .get<DepartamentoResult[]>(`${this.apiUrl}/departamentos`, {
          params: {
            departamentoIds: departamentoIds.join(',')
          }
        })
    )

    return response.data;
  }

  async updateDepartamento(id: string, dto: UpdateDepartamentoDto) {
    const response = await firstValueFrom(
      this.httpService
        .patch<DepartamentoResult>(`${this.apiUrl}/departamentos/${id}`, dto)
        .pipe(this.handleError('Error updating departamento'))
    )

    return response.data;
  }

  async desativarDepartamento(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .post<DepartamentoResult>(`${this.apiUrl}/departamentos/${id}/desativar`)
        .pipe(this.handleError('Error deactivating departamento'))
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
