import { Inject, Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, OperatorFunction } from 'rxjs';
import { AxiosError } from 'axios';
import {
  FuncionarioResponse,
  CreateFuncionarioDto,
  UpdateFuncionarioDto,
  GetFuncionariosQueryDto,
} from '@app/contracts';

@Injectable()
export class FuncionarioService {
  private readonly logger = new Logger(FuncionarioService.name);

  constructor(
    @Inject('FUNCIONARIO_SERVICE_URL') private readonly apiUrl: string, private readonly httpService: HttpService) { }

  async getFuncionarios(query: GetFuncionariosQueryDto) {
    const response = await firstValueFrom(
      this.httpService
        .get<{
          data: FuncionarioResponse[];
          total: number;
          page: number;
          limit: number;
        }>(`${this.apiUrl}/funcionarios`, {
          params: {
            ...(query.funcionarioIds?.length
              ? { funcionarioIds: query.funcionarioIds.join(',') }
              : {}),
            page: query.page,
            limit: query.limit,
          },
        })
        .pipe(this.handleError('Error fetching funcionarios'))
    )

    return response.data;
  }

  async createFuncionario(dto: CreateFuncionarioDto) {
    const response = await firstValueFrom(
      this.httpService
        .post<FuncionarioResponse>(`${this.apiUrl}/funcionarios`, dto)
        .pipe(this.handleError('Error creating funcionario'))
    )

    return response.data;
  }

  async getFuncionario(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .get<FuncionarioResponse>(`${this.apiUrl}/funcionarios/${id}`)
        .pipe(this.handleError('Error fetching funcionario'))
    )

    return response.data;
  }

  async updateFuncionario(id: string, dto: UpdateFuncionarioDto) {
    const response = await firstValueFrom(
      this.httpService
        .patch<FuncionarioResponse>(`${this.apiUrl}/funcionarios/${id}`, dto)
        .pipe(this.handleError('Error updating funcionario'))
    )

    return response.data;
  }

  async demitirFuncionario(id: string) {
    const response = await firstValueFrom(
      this.httpService
        .post<FuncionarioResponse>(`${this.apiUrl}/funcionarios/${id}/demitir`)
        .pipe(this.handleError('Error demitindo funcionario'))
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
