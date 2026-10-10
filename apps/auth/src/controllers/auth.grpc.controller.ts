import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import {
  AuthResponse,
  AuthServiceController,
  AuthServiceControllerMethods,
  CreateUsuarioDto,
  GetUsuarioRequest,
  LoginDto,
  LogoutRequest,
  LogoutResponse,
  RefreshRequest,
  UsuarioResponse,
} from '@app/contracts';
import { GrpcValidationPipe } from '@app/common';

@Controller()
@AuthServiceControllerMethods()
@UsePipes(GrpcValidationPipe)
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  async login(request: LoginDto): Promise<AuthResponse> {
    const { email, senha } = request;

    return this.authService.login({ email, senha });
  }

  async criarUsuario(dto: CreateUsuarioDto): Promise<UsuarioResponse> {
    return this.authService.criarUsuario(dto);
  }

  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    const { refreshToken } = request;

    return this.authService.logout(refreshToken);
  }

  async refresh(request: RefreshRequest): Promise<AuthResponse> {
    const { refreshToken } = request;

    return this.authService.refresh(refreshToken);
  }

  async getUsuario(request: GetUsuarioRequest): Promise<UsuarioResponse> {
    const { id } = request;

    return this.authService.getUsuario(id);
  }
}
