import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity.js';
import {
  AuthResponse,
  CreateUsuarioDto,
  LoginDto,
  LogoutResponse,
  UsuarioResponse,
} from '@app/contracts';
import { FuncionarioClientService } from '../funcionario-client/funcionario-client.service.js';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly dummyHash = argon2.hash(randomUUID());

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly tokenService: TokenService,
    private readonly funcionarioClient: FuncionarioClientService,
  ) {}

  async criarUsuario(dto: CreateUsuarioDto): Promise<UsuarioResponse> {
    if (await this.usuarioRepository.findOne({ where: { email: dto.email } })) {
      throw this.error(
        status.ALREADY_EXISTS,
        'Usuário com esse email já existe',
      );
    }

    if (
      await this.usuarioRepository.findOne({
        where: { funcionarioId: dto.funcionarioId },
      })
    ) {
      throw this.error(
        status.ALREADY_EXISTS,
        'Usuário para esse funcionário já existe',
      );
    }

    const funcionario = await this.funcionarioClient.getFuncionario(
      dto.funcionarioId,
    );

    if (funcionario.dataDemissao) {
      throw this.error(
        status.FAILED_PRECONDITION,
        'Funcionário está desligado e não pode ter usuário',
      );
    }

    const usuario = await this.usuarioRepository.save(
      this.usuarioRepository.create({
        id: randomUUID(),
        email: dto.email,
        senhaHash: await argon2.hash(dto.senha),
        roles: dto.roles,
        funcionarioId: dto.funcionarioId,
      }),
    );

    return this.toUsuarioResponse(usuario);
  }

  async login(dto: LoginDto) {
    const { email, senha } = dto;
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    const senhaValida = await argon2.verify(
      usuario?.senhaHash ?? (await this.dummyHash),
      senha,
    );

    if (!usuario || !senhaValida || !usuario.ativo) {
      throw this.error(status.UNAUTHENTICATED, 'Email ou senha inválidos');
    }

    return this.issueTokens(usuario, randomUUID(), new Date());
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = this.tokenService.hashToken(refreshToken);

    const tokenAtual = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: { usuario: true },
    });

    if (!tokenAtual?.usuario) {
      throw this.error(status.UNAUTHENTICATED, 'Refresh token inválido.');
    }

    if (tokenAtual.revokedAt) {
      await this.revokeFamily(tokenAtual.familyId);
      throw this.error(
        status.UNAUTHENTICATED,
        'Refresh token revogado. Faça login novamente.',
      );
    }

    const agora = new Date();

    if (
      tokenAtual.expiresAt < agora ||
      this.tokenService.isSessionExpired(tokenAtual.sessionCreatedAt, agora)
    ) {
      throw this.error(
        status.UNAUTHENTICATED,
        'Refresh token expirado. Faça login novamente.',
      );
    }

    if (!tokenAtual.usuario.ativo) {
      await this.revokeFamily(tokenAtual.familyId);
      throw this.error(
        status.UNAUTHENTICATED,
        'Usuário desativado. Faça login novamente.',
      );
    }

    // revoga de forma atômica: só um dos pedidos concorrentes consegue "gastar" o token
    const { affected } = await this.refreshTokenRepository.update(
      { id: tokenAtual.id, revokedAt: IsNull() },
      { revokedAt: agora },
    );

    if (affected !== 1) {
      await this.revokeFamily(tokenAtual.familyId);
      throw this.error(
        status.UNAUTHENTICATED,
        'Refresh token já foi usado. Faça login novamente.',
      );
    }

    return this.issueTokens(
      tokenAtual.usuario,
      tokenAtual.familyId,
      tokenAtual.sessionCreatedAt,
    );
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    const tokenHash = this.tokenService.hashToken(refreshToken);

    const tokenAtual = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (tokenAtual) {
      await this.revokeFamily(tokenAtual.familyId);
    }

    return { success: true };
  }

  async getUsuario(id: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw this.error(status.NOT_FOUND, 'Usuário não encontrado.');
    }

    return this.toUsuarioResponse(usuario);
  }

  private async revokeFamily(familyId: string) {
    return this.refreshTokenRepository.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async issueTokens(
    usuario: Usuario,
    familyId: string,
    sessionCreatedAt: Date,
  ): Promise<AuthResponse> {
    const { token, tokenHash } = this.tokenService.generateRefreshToken();

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        id: randomUUID(),
        usuarioId: usuario.id,
        tokenHash,
        familyId,
        sessionCreatedAt,
        expiresAt: this.tokenService.refreshExpiresAt(),
      }),
    );

    return {
      accessToken: await this.tokenService.signAccessToken(usuario),
      refreshToken: token,
      expiresIn: this.tokenService.accessTtlSeconds,
      usuario: this.toUsuarioResponse(usuario),
    };
  }

  private toUsuarioResponse(usuario: Usuario): UsuarioResponse {
    return {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      funcionarioId: usuario.funcionarioId ?? '',
    };
  }

  private error(code: status, message: string) {
    return new RpcException({ code, message });
  }
}
