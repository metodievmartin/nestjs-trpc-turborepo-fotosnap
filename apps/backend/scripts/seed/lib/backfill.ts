/**
 * Feed backfill helpers — populate feed inbox tables from existing data.
 */

import { eq, and, gt, lt, sql } from 'drizzle-orm';

import {
  type SeedDb,
  authSchema,
  postsSchema,
  storiesSchema,
  feedSchema,
} from './db';

const CELEBRITY_THRESHOLD = 10_000;
const BATCH_SIZE = 1000;

/**
 * Returns the IDs of non-celebrity users that `viewerId` follows,
 * plus the viewer's own ID.
 */
async function getSourceUserIds(
  db: SeedDb,
  viewerId: string,
): Promise<string[]> {
  const followed = await db
    .select({ followingId: authSchema.follow.followingId })
    .from(authSchema.follow)
    .innerJoin(
      authSchema.user,
      eq(authSchema.follow.followingId, authSchema.user.id),
    )
    .where(
      and(
        eq(authSchema.follow.followerId, viewerId),
        lt(authSchema.user.followerCount, CELEBRITY_THRESHOLD),
      ),
    );

  return [viewerId, ...followed.map((f) => f.followingId)];
}

/**
 * Updates the `followerCount` column on every user based on actual
 * follow rows.
 */
export async function updateFollowerCounts(db: SeedDb): Promise<void> {
  console.log('Updating follower counts...');
  await db.execute(sql`
    UPDATE "user"
    SET follower_count = (
      SELECT COUNT(*)::int
      FROM follow
      WHERE follow.following_id = "user".id
    )
  `);
  console.log('  Follower counts updated.');
}

/**
 * Backfills `feed_post_item` for all users based on their follow graph.
 */
export async function backfillPostFeed(db: SeedDb): Promise<void> {
  console.log('Clearing existing post feed items...');
  await db.delete(feedSchema.feedPostItem);

  console.log('Backfilling post feed items...');

  const users = await db
    .select({ id: authSchema.user.id })
    .from(authSchema.user);

  let totalPostItems = 0;

  for (const viewer of users) {
    const sourceUserIds = await getSourceUserIds(db, viewer.id);

    const posts = await db
      .select({
        id: postsSchema.post.id,
        userId: postsSchema.post.userId,
        createdAt: postsSchema.post.createdAt,
      })
      .from(postsSchema.post)
      .where(sql`${postsSchema.post.userId} IN ${sourceUserIds}`);

    if (posts.length > 0) {
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        const batch = posts.slice(i, i + BATCH_SIZE);
        await db
          .insert(feedSchema.feedPostItem)
          .values(
            batch.map((p) => ({
              userId: viewer.id,
              postId: p.id,
              sourceUserId: p.userId,
              createdAt: p.createdAt,
            })),
          )
          .onConflictDoNothing();
      }
      totalPostItems += posts.length;
    }

    process.stdout.write('.');
  }

  console.log(`\n  ${totalPostItems} post feed items created.`);
}

/**
 * Backfills `feed_story_item` for all users based on their follow graph
 * and currently active (non-expired) stories.
 */
export async function backfillStoryFeed(db: SeedDb): Promise<void> {
  console.log('Clearing existing story feed items...');
  await db.delete(feedSchema.feedStoryItem);

  console.log('Backfilling story feed items...');

  const users = await db
    .select({ id: authSchema.user.id })
    .from(authSchema.user);

  const now = new Date();
  let totalStoryItems = 0;

  for (const viewer of users) {
    const sourceUserIds = await getSourceUserIds(db, viewer.id);

    const stories = await db
      .select({
        id: storiesSchema.story.id,
        userId: storiesSchema.story.userId,
        createdAt: storiesSchema.story.createdAt,
        expiresAt: storiesSchema.story.expiresAt,
      })
      .from(storiesSchema.story)
      .where(
        and(
          sql`${storiesSchema.story.userId} IN ${sourceUserIds}`,
          gt(storiesSchema.story.expiresAt, now),
        ),
      );

    if (stories.length > 0) {
      for (let i = 0; i < stories.length; i += BATCH_SIZE) {
        const batch = stories.slice(i, i + BATCH_SIZE);
        await db
          .insert(feedSchema.feedStoryItem)
          .values(
            batch.map((s) => ({
              userId: viewer.id,
              storyId: s.id,
              sourceUserId: s.userId,
              createdAt: s.createdAt,
              expiresAt: s.expiresAt,
            })),
          )
          .onConflictDoNothing();
      }
      totalStoryItems += stories.length;
    }

    process.stdout.write('.');
  }

  console.log(`\n  ${totalStoryItems} story feed items created.`);
}
