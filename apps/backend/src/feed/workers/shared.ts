import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';

import { schema } from '../../database/database.module';
import { follow } from '../../auth/schema';

export const BATCH_SIZE = 1000;

/**
 * Structured one-line log for a worker lifecycle event. Keeps format identical
 * across the three processors so operators can grep/parse consistently.
 *
 * BullMQ maintains `job.processedOn` (set when the job becomes active) and
 * `job.finishedOn` (set on completion/failure) natively — we derive duration
 * from those rather than hooking the `active` event manually.
 *
 * `job` may be `undefined` for worker-level `failed` events (Redis disconnect
 * mid-processing, etc.). We still log them — they're exactly the operational
 * problems worth surfacing.
 *
 * Volume: `active` fires once per job start and can be thousands per minute
 * under fan-out load, so it drops to `debug`. `completed` already carries
 * `durationMs`, which is the more useful signal at info level.
 */
export function logWorkerEvent(
  logger: Logger,
  event: 'active' | 'completed' | 'failed' | 'stalled',
  queue: string,
  job: Job | string | undefined,
  extra: Record<string, unknown> = {},
): void {
  const payload: Record<string, unknown> = { event, queue, ...extra };

  if (typeof job === 'string') {
    payload.jobId = job;
  } else if (job) {
    payload.jobName = job.name;
    payload.jobId = job.id;
    payload.attemptsMade = job.attemptsMade;
    if (job.processedOn && job.finishedOn) {
      payload.durationMs = job.finishedOn - job.processedOn;
    }
  }

  const line = JSON.stringify(payload);
  if (event === 'failed' || event === 'stalled') {
    logger.warn(line);
  } else if (event === 'active') {
    logger.debug(line);
  } else {
    logger.log(line);
  }
}

/**
 * Yields pages of follower IDs for a given followingId using keyset pagination
 * on `follow.followerId`. Terminates when a page returns fewer than BATCH_SIZE
 * rows. Callers iterate pages and perform their own per-page side effects.
 */
export async function* iterateFollowerIdsPaged(
  database: NodePgDatabase<typeof schema>,
  followingId: string,
): AsyncGenerator<string[], void, void> {
  let lastFollowerId: string | undefined;

  while (true) {
    const conditions = [eq(follow.followingId, followingId)];
    if (lastFollowerId) {
      conditions.push(
        sql`${follow.followerId} > ${lastFollowerId}` as ReturnType<typeof eq>,
      );
    }

    const rows = await database
      .select({ followerId: follow.followerId })
      .from(follow)
      .where(and(...conditions))
      .orderBy(follow.followerId)
      .limit(BATCH_SIZE);

    if (rows.length === 0) return;

    yield rows.map((r) => r.followerId);

    lastFollowerId = rows[rows.length - 1].followerId;

    if (rows.length < BATCH_SIZE) return;
  }
}
