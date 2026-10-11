import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from './authentication-service.service.js';
import type { Response, Request } from 'express';
import {
  CurrentUser,
  OriginGuard,
  Public,
  REFRESH_TOKEN_COOKIE,
  RefreshTokenCookieGuard,
  Roles,
} from '@app/common';
import {
  AuthenticationResponse,
  CreateUsuarioDto,
  LoginDto,
  Role,
  UsuarioResponse,
} from '@app/contracts';
import type { JwtPayload } from '@app/contracts';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly config: ConfigService,
  ) {}

  @Roles(Role.ADMIN)
  @Post('criar-usuario')
  async criarUsuario(@Body() body: CreateUsuarioDto): Promise<UsuarioResponse> {
    return await this.authenticationService.criarUsuario(body);
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticationResponse> {
    const { refreshToken, ...authResponse } =
      await this.authenticationService.login(body);

    this.setRefreshTokenCookie(res, refreshToken);
    return authResponse;
  }

  @Public()
  @UseGuards(OriginGuard, RefreshTokenCookieGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticationResponse> {
    const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string;
    const { refreshToken, ...authResponse } =
      await this.authenticationService.refreshToken(incomingRefreshToken);

    this.setRefreshTokenCookie(res, refreshToken);
    return authResponse;
  }

  @Public()
  @UseGuards(OriginGuard, RefreshTokenCookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string;
    await this.authenticationService.logout(incomingRefreshToken);

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      path: '/auth',
    });
  }

  @Get('me')
  async getUsuario(@CurrentUser() user: JwtPayload): Promise<UsuarioResponse> {
    return await this.authenticationService.getUsuario(user.sub);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(this.config.getOrThrow<string>('REFRESH_TOKEN_TTL')) * 1000,
      path: '/auth',
    });
  }
}
