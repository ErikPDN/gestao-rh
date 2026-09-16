import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartamentoService {
  getHello(): string {
    return 'Hello World!';
  }
}
