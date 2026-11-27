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
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
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
import { FileInterceptor } from '@nestjs/platform-express';
import type { AlterarSenhaDto, JwtPayload } from '@app/contracts';
import {
  DeleteAvatarResponse,
  UploadAvatarResponse,
} from '@app/contracts/auth/grpc/proto/auth.js';

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

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadAvatarResponse> {
    return this.authenticationService.uploadAvatar(user.sub, file);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('me/avatar')
  async deleteAvatar(
    @CurrentUser() user: JwtPayload,
  ): Promise<DeleteAvatarResponse> {
    return this.authenticationService.deleteAvatar(user.sub);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('senha')
  async alterarSenha(
    @CurrentUser() user: JwtPayload,
    @Body() body: AlterarSenhaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authenticationService.alterarSenha(user.sub, body);

    // as sessoes foram invalidadas, o refresh token atual deve ser removido do cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
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
