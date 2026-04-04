/**
 * Post seeding logic.
 */

import { inArray } from 'drizzle-orm';

import { SEED_POSTS } from '../data/posts';
import { type SeedDb, postsSchema, commentSchema } from './db';

/**
 * Deletes existing posts for the given seed user IDs, then inserts
 * fresh posts with backdated timestamps.
 */
export async function seedPosts(
  db: SeedDb,
  userIds: string[],
): Promise<number> {
  const seedUserIds = [
    ...new Set(SEED_POSTS.map((p) => userIds[p.userIndex]).filter(Boolean)),
  ];

  // Delete comments and likes on seed-user posts first (FK constraints)
  console.log('Deleting existing seed-user post comments & likes...');
  const existingPosts = await db
    .select({ id: postsSchema.post.id })
    .from(postsSchema.post)
    .where(inArray(postsSchema.post.userId, seedUserIds));

  if (existingPosts.length > 0) {
    const postIds = existingPosts.map((p) => p.id);
    await db
      .delete(commentSchema.comment)
      .where(inArray(commentSchema.comment.postId, postIds));
    await db
      .delete(postsSchema.like)
      .where(inArray(postsSchema.like.postId, postIds));
  }

  console.log('Deleting existing seed-user posts...');
  await db
    .delete(postsSchema.post)
    .where(inArray(postsSchema.post.userId, seedUserIds));

  console.log('Creating posts...');
  let postCount = 0;

  for (const seedPost of SEED_POSTS) {
    const userId = userIds[seedPost.userIndex];
    if (!userId) continue;

    const now = new Date();
    const createdAt = new Date(
      now.getTime() - seedPost.daysAgo * 24 * 60 * 60 * 1000,
    );

    await db.insert(postsSchema.post).values({
      userId,
      image: seedPost.image,
      caption: seedPost.caption,
      createdAt,
    });
    postCount++;
  }

  console.log(`  ${postCount} posts created.`);
  return postCount;
}
