import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import type { JwtPayload } from '@app/contracts';
import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class TokenService {
  readonly accessTtlSeconds: number;
  private readonly refreshTtlMs: number;
  private readonly absoluteTtlMs: number;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.accessTtlSeconds = this.readSeconds(config, 'JWT_ACCESS_TTL');
    this.refreshTtlMs = this.readSeconds(config, 'REFRESH_TOKEN_TTL') * 1000;
    this.absoluteTtlMs =
      this.readSeconds(config, 'REFRESH_TOKEN_ABSOLUTE_TTL') * 1000;
  }

  signAccessToken(usuario: Usuario): Promise<string> {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      funcionarioId: usuario.funcionarioId ?? undefined,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.accessTtlSeconds,
    });
  }

  generateRefreshToken(): { token: string; tokenHash: string } {
    const token = randomBytes(64).toString('hex');
    return { token, tokenHash: this.hashToken(token) };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  refreshExpiresAt(from: Date = new Date()): Date {
    return new Date(from.getTime() + this.refreshTtlMs);
  }

  isSessionExpired(sessionCreatedAt: Date, now: Date = new Date()): boolean {
    return sessionCreatedAt.getTime() + this.absoluteTtlMs < now.getTime();
  }

  private readSeconds(config: ConfigService, key: string): number {
    const value = Number(config.getOrThrow<string>(key));
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${key} deve ser um inteiro positivo (em segundos).`);
    }
    return value;
  }
}
