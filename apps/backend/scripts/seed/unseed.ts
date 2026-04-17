/**
 * Removes all seed users and their associated data (posts, stories,
 * comments, likes, follows, feed items, sessions, accounts).
 *
 * Usage:
 *   npm run db:unseed          (from apps/backend or repo root)
 *
 * Non-seed users and their data are left untouched.
 */

import { inArray } from 'drizzle-orm';

import { SEED_USERS } from './data/users';
import {
  createDb,
  authSchema,
  postsSchema,
  commentSchema,
  storiesSchema,
  feedSchema,
} from './lib/db';

async function unseed() {
  console.log('Removing seed data...\n');

  const { pool, db } = createDb();

  // --- Look up seed user IDs by email ---
  const seedEmails = SEED_USERS.map((u) => u.email);
  const seedUserRows = await db
    .select({ id: authSchema.user.id, email: authSchema.user.email })
    .from(authSchema.user)
    .where(inArray(authSchema.user.email, seedEmails));

  if (seedUserRows.length === 0) {
    console.log('No seed users found. Nothing to remove.');
    await pool.end();
    return;
  }

  const seedUserIds = seedUserRows.map((r) => r.id);
  console.log(`Found ${seedUserIds.length} seed users to remove.`);

  // --- Get seed-user post IDs (needed for comment/like cleanup) ---
  const seedPosts = await db
    .select({ id: postsSchema.post.id })
    .from(postsSchema.post)
    .where(inArray(postsSchema.post.userId, seedUserIds));
  const seedPostIds = seedPosts.map((p) => p.id);

  // --- Delete in dependency order ---

  // Feed items (FK to post/story/user)
  console.log('Deleting feed items...');
  await db
    .delete(feedSchema.feedPostItem)
    .where(inArray(feedSchema.feedPostItem.userId, seedUserIds));
  await db
    .delete(feedSchema.feedStoryItem)
    .where(inArray(feedSchema.feedStoryItem.userId, seedUserIds));

  // Comments & likes on seed-user posts (no cascade from user)
  if (seedPostIds.length > 0) {
    console.log('Deleting comments & likes...');
    await db
      .delete(commentSchema.comment)
      .where(inArray(commentSchema.comment.postId, seedPostIds));
    await db
      .delete(postsSchema.like)
      .where(inArray(postsSchema.like.postId, seedPostIds));
  }

  // Posts (no cascade from user)
  console.log('Deleting posts...');
  await db
    .delete(postsSchema.post)
    .where(inArray(postsSchema.post.userId, seedUserIds));

  // Stories (cascade from user, but being explicit)
  console.log('Deleting stories...');
  await db
    .delete(storiesSchema.story)
    .where(inArray(storiesSchema.story.userId, seedUserIds));

  // Follows (no cascade from user)
  console.log('Deleting follows...');
  await db
    .delete(authSchema.follow)
    .where(inArray(authSchema.follow.followerId, seedUserIds));
  await db
    .delete(authSchema.follow)
    .where(inArray(authSchema.follow.followingId, seedUserIds));

  // Users (cascades sessions + accounts)
  console.log('Deleting users...');
  await db
    .delete(authSchema.user)
    .where(inArray(authSchema.user.id, seedUserIds));

  console.log(`\nRemoved ${seedUserIds.length} seed users and all their data.`);

  await pool.end();
}

unseed().catch((err) => {
  console.error('Unseed failed:', err);
  process.exit(1);
});
