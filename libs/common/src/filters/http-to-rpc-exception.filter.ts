import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

const HTTP_TO_GRPC: Partial<Record<number, status>> = {
  400: status.INVALID_ARGUMENT,
  401: status.UNAUTHENTICATED,
  403: status.PERMISSION_DENIED,
  404: status.NOT_FOUND,
  409: status.ALREADY_EXISTS,
  422: status.FAILED_PRECONDITION,
  503: status.UNAVAILABLE,
};

@Catch(HttpException)
export class HttpToRpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = exception.getResponse();
    const rawMessage =
      typeof response === 'string'
        ? response
        : (response as { message?: string | string[] }).message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : (rawMessage ?? exception.message);

    return super.catch(
      new RpcException({
        code: HTTP_TO_GRPC[exception.getStatus()] ?? status.INTERNAL,
        message,
      }),
      host,
    );
  }
}
