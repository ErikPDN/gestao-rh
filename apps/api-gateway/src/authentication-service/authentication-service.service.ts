import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  CreateUsuarioDto,
  LoginDto,
} from '@app/contracts';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthenticationService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_PACKAGE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  criarUsuario(dto: CreateUsuarioDto) {
    return firstValueFrom(this.authService.criarUsuario(dto));
  }

  login(dto: LoginDto) {
    return firstValueFrom(this.authService.login(dto));
  }

  refreshToken(refreshToken: string) {
    return firstValueFrom(this.authService.refresh({ refreshToken }));
  }

  logout(refreshToken: string) {
    return firstValueFrom(this.authService.logout({ refreshToken }));
  }

  getUsuario(id: string) {
    return firstValueFrom(this.authService.getUsuario({ id }));
  }
}
