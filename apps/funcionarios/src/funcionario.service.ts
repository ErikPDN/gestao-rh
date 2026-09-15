import { Injectable } from '@nestjs/common';

@Injectable()
export class FuncionarioService {
  getHello(): string {
    return 'Hello World!';
  }
}
