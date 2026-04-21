import { IncomingHttpHeaders } from 'node:http';

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@thallesp/nestjs-better-auth';

import { checkAdminAccess, parseAdminUserIds } from './admin-auth';

/**
 * Opt-in guard that allows only admins through Nest controllers. Apply with
 * `@UseGuards(AdminGuard)` on specific routes; the global `AuthGuard` still
 * runs first for unauthenticated-request rejection.
 *
 * For HTTP surfaces that live outside Nest's controller layer (e.g., Bull
 * Board's Express sub-router), use `AdminAuthMiddleware` instead — guards
 * don't fire for middleware-mounted routes.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminUserIds: ReadonlySet<string>;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.adminUserIds = parseAdminUserIds(configService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: IncomingHttpHeaders }>();
    const result = await checkAdminAccess(
      this.authService,
      req.headers,
      this.adminUserIds,
    );

    if (result === 'unauthenticated') throw new UnauthorizedException();
    if (result === 'forbidden') throw new ForbiddenException();
    return true;
  }
}
