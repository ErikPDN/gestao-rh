import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { status } from '@grpc/grpc-js';

interface GrpcError {
  code: number;
  details?: string;
}

const GRPC_TO_HTTP: Partial<Record<number, HttpStatus>> = {
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.FAILED_PRECONDITION]: HttpStatus.UNPROCESSABLE_ENTITY,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};

const isGrpcError = (exception: unknown): exception is GrpcError =>
  typeof exception === 'object' &&
  exception !== null &&
  !(exception instanceof HttpException) &&
  typeof (exception as GrpcError).code === 'number' &&
  'metadata' in exception;

@Catch()
export class GrpcExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!isGrpcError(exception)) {
      return super.catch(exception, host);
    }

    const httpStatus =
      GRPC_TO_HTTP[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      httpStatus < HttpStatus.INTERNAL_SERVER_ERROR && exception.details
        ? exception.details
        : httpStatus === HttpStatus.SERVICE_UNAVAILABLE
          ? 'Serviço temporariamente indisponível.'
          : 'Erro interno do servidor.';

    return super.catch(new HttpException(message, httpStatus), host);
  }
}
