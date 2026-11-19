import { ChannelCredentials } from '@grpc/grpc-js';

export function grpcCredentials(): ChannelCredentials | undefined {
  return process.env.GRPC_CREDENTIALS === 'true'
    ? ChannelCredentials.createSsl()
    : undefined;
}
