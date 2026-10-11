import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@app/contracts';
import type { AuthenticatedRequest } from './authenticated-request.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
