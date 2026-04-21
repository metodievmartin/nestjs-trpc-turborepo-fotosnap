import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';

import { schema } from '../../database/database.module';
import { follow } from '../../auth/schema';

export const BATCH_SIZE = 1000;

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
