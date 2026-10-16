import { UsuarioResponse } from '../grpc/proto/auth.js';

export interface AuthenticationResponse {
  accessToken: string;
  expiresIn: number;
  usuario: UsuarioResponse | undefined;
}
