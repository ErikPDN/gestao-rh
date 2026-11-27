import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity.js';
import {
  AuthResponse,
  CreateUsuarioDto,
  FuncionarioResponse,
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
import { In, IsNull, Not, Repository } from 'typeorm';
import {
  GetAvataresResponse,
  UploadAvatarResponse,
} from '@app/contracts/auth/grpc/proto/auth.js';
import { StorageService } from '../storage/storage.service.js';

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
    private readonly storageService: StorageService,
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

    let funcionario: FuncionarioResponse | undefined;

    if (usuario.funcionarioId) {
      funcionario = await this.funcionarioClient.getFuncionario(
        usuario.funcionarioId,
      );

      if (funcionario.dataDemissao) {
        throw this.error(
          status.FAILED_PRECONDITION,
          'Funcionário está desligado e não pode ter usuário',
        );
      }
    }

    return this.toUsuarioResponse(usuario, funcionario);
  }

  async alterarSenha(id: string, senhaAtual: string, senhaNova: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario || !usuario.ativo) {
      throw this.error(status.NOT_FOUND, 'Usuário não encontrado.');
    }

    if (!(await argon2.verify(usuario.senhaHash, senhaAtual))) {
      throw this.error(status.PERMISSION_DENIED, 'Senha atual incorreta.');
    }

    if (senhaAtual === senhaNova) {
      throw this.error(
        status.INVALID_ARGUMENT,
        'A nova senha deve ser diferente da senha atual.',
      );
    }

    usuario.senhaHash = await argon2.hash(senhaNova);
    await this.usuarioRepository.save(usuario);

    await this.refreshTokenRepository.update(
      { usuarioId: usuario.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async updateAvatar(
    usuarioId: string,
    conteudo: Uint8Array,
    contentType: string,
  ): Promise<UploadAvatarResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw this.error(status.NOT_FOUND, 'Usuário não encontrado.');
    }

    const ext = contentType.split('/')[1];
    const avatarKey = `${usuarioId}/${randomUUID()}.${ext}`;

    await this.storageService.upload(avatarKey, conteudo, contentType);

    await this.usuarioRepository.update(usuarioId, { avatarKey });

    if (usuario.avatarKey) {
      await this.storageService.delete(usuario.avatarKey);
    }

    return { avatarUrl: await this.storageService.getUrl(avatarKey) };
  }

  async deleteAvatar(usuarioId: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw this.error(status.NOT_FOUND, 'Usuário não encontrado.');
    }

    if (!usuario.avatarKey) return;

    await this.usuarioRepository.update(usuarioId, { avatarKey: null });
    await this.storageService.delete(usuario.avatarKey);
  }

  async getAvatares(funcionarioIds: string[]): Promise<GetAvataresResponse> {
    if (!funcionarioIds.length) return { avatares: [] };

    const usuarios = await this.usuarioRepository.find({
      where: {
        funcionarioId: In(funcionarioIds),
        avatarKey: Not(IsNull()),
      },
    });

    return {
      avatares: await Promise.all(
        usuarios.map(async (usuario) => ({
          funcionarioId: usuario.funcionarioId!,
          avatarUrl: await this.storageService.getUrl(usuario.avatarKey!),
        })),
      ),
    };
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

    let funcionario: FuncionarioResponse | undefined;
    if (usuario.funcionarioId) {
      funcionario = await this.funcionarioClient.getFuncionario(
        usuario.funcionarioId,
      );
    }

    return {
      accessToken: await this.tokenService.signAccessToken(usuario),
      refreshToken: token,
      expiresIn: this.tokenService.accessTtlSeconds,
      usuario: await this.toUsuarioResponse(usuario, funcionario),
    };
  }

  private async toUsuarioResponse(
    usuario: Usuario,
    funcionario?: FuncionarioResponse,
  ): Promise<UsuarioResponse> {
    return {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      funcionarioId: usuario.funcionarioId ?? '',
      nome: funcionario?.nome,
      avatarUrl: usuario.avatarKey
        ? await this.storageService.getUrl(usuario.avatarKey)
        : undefined,
      cargo: funcionario?.cargo,
      departamento: funcionario?.departamento,
    };
  }

  private error(code: status, message: string) {
    return new RpcException({ code, message });
  }
}
