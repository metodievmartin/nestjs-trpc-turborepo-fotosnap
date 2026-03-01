import { Injectable, Logger } from '@nestjs/common';
import {
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { Session, User } from '@better-auth/core/db';
import type { BaseContext } from '../app-context.interface';

@Injectable()
export class AuthTrpcMiddleware implements TRPCMiddleware {
  private readonly logger = new Logger(AuthTrpcMiddleware.name);

  constructor(private readonly authService: AuthService) {}

  async use(opts: MiddlewareOptions<BaseContext>): Promise<MiddlewareResponse> {
    const { ctx, next } = opts;

    let session: { user: User; session: Session } | null;
    try {
      session = await this.authService.api.getSession({
        headers: ctx.req.headers as unknown as HeadersInit,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve session', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    if (!session?.user || !session?.session) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
      ctx: {
        ...ctx,
        user: session.user,
        session: session.session,
      },
    });
  }
}
