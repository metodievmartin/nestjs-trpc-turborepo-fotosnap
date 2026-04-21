import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Request, Response, NextFunction } from 'express';

import { checkAdminAccess, parseAdminUserIds } from './admin-auth';

/**
 * Express-style middleware that gates a sub-tree of HTTP routes behind admin
 * auth. Used by `/api/admin/queues` (Bull Board) because Bull Board mounts
 * an Express sub-router rather than a Nest controller, so the `AdminGuard`
 * (which only runs in Nest's request lifecycle) doesn't apply there.
 *
 * Same auth logic as `AdminGuard` — both delegate to `checkAdminAccess`.
 */
@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminAuthMiddleware.name);
  private readonly adminUserIds: ReadonlySet<string>;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.adminUserIds = parseAdminUserIds(configService);
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    let result;
    try {
      result = await checkAdminAccess(
        this.authService,
        req.headers,
        this.adminUserIds,
      );
    } catch (err) {
      this.logger.error('Failed to resolve admin session', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (result === 'unauthenticated') {
      res.status(401).send('Unauthorized');
      return;
    }
    if (result === 'forbidden') {
      res.status(403).send('Forbidden');
      return;
    }

    next();
  }
}
