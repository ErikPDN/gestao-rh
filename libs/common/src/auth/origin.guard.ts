import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  private readonly allowedOrigin: string;

  constructor(config: ConfigService) {
    this.allowedOrigin = new URL(config.getOrThrow<string>('FRONTEND_URL')).origin;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    return request.headers.origin === this.allowedOrigin;
  }
}
