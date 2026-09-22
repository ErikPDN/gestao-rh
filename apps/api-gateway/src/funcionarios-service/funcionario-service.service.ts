import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FuncionarioService {
  constructor(
    @Inject('FUNCIONARIO_SERVICE_URL') private readonly apiUrl: string,
    private readonly httpService: HttpService
  ) { }

  async getFuncionarios(funcionarioIds: string[]) { }
}
