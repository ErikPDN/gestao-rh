import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  funcionarioId?: string;
}
