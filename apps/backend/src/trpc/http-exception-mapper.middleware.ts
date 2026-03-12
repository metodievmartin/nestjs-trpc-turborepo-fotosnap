import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import {
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

const HTTP_TO_TRPC_CODE: Record<number, TRPC_ERROR_CODE_KEY> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_SUPPORTED',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
};

@Injectable()
export class HttpExceptionMapperMiddleware implements TRPCMiddleware {
  async use({ next }: MiddlewareOptions): Promise<MiddlewareResponse> {
    const result = await next();

    if (!result.ok) {
      const { error } = result;

      if (error instanceof TRPCError && error.cause instanceof HttpException) {
        const code =
          HTTP_TO_TRPC_CODE[error.cause.getStatus()] ?? 'INTERNAL_SERVER_ERROR';
        throw new TRPCError({
          code,
          message: error.cause.message,
          cause: error.cause,
        });
      }
    }

    return result;
  }
}
