import type { Request } from 'express';
import type { JwtPayload } from '@app/contracts';

export type AuthenticatedRequest = Request & { user?: JwtPayload };
