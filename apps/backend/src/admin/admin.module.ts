import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import {
  FEED_FANOUT_QUEUE,
  FEED_BACKFILL_QUEUE,
  FEED_CLEANUP_QUEUE,
} from '../feed/feed.constants';
import { AdminAuthMiddleware } from './admin-auth.middleware';
import { AdminGuard } from './admin.guard';

/**
 * Owns admin-only HTTP surface:
 *  - Mounts Bull Board at `/api/admin/queues`, gated by
 *    {@link AdminAuthMiddleware}.
 *  - Exports {@link AdminGuard} for any Nest controller that wants to opt in
 *    via `@UseGuards(AdminGuard)` — downstream modules import `AdminModule`.
 *
 * Bull Board is read-only infra (talks to Redis, stores no state of its own)
 * and only belongs in processes that serve HTTP — i.e., the API process, not
 * worker-only processes.
 */
@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      middleware: AdminAuthMiddleware,
    }),
    BullBoardModule.forFeature(
      { name: FEED_FANOUT_QUEUE, adapter: BullMQAdapter },
      { name: FEED_BACKFILL_QUEUE, adapter: BullMQAdapter },
      { name: FEED_CLEANUP_QUEUE, adapter: BullMQAdapter },
    ),
  ],
  providers: [AdminAuthMiddleware, AdminGuard],
  exports: [AdminGuard],
})
export class AdminModule {}
