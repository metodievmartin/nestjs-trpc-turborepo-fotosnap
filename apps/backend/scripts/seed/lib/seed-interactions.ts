/**
 * Like and comment seeding logic.
 *
 * Posts must be seeded first — this function looks up post IDs by
 * matching (userId, image) pairs from SEED_POSTS.
 */

import { eq, and } from 'drizzle-orm';

import { SEED_POSTS } from '../data/posts';
import { SEED_LIKES, SEED_COMMENTS } from '../data/interactions';
import { type SeedDb, postsSchema, commentSchema } from './db';

/**
 * Builds an ordered map of postIndex → postId by matching each seed
 * post's (userId, image) pair against the database.
 */
async function resolvePostIds(
  db: SeedDb,
  userIds: string[],
): Promise<Map<number, number>> {
  const postIdMap = new Map<number, number>();

  for (let i = 0; i < SEED_POSTS.length; i++) {
    const seedPost = SEED_POSTS[i];
    const userId = userIds[seedPost.userIndex];
    if (!userId) continue;

    const [row] = await db
      .select({ id: postsSchema.post.id })
      .from(postsSchema.post)
      .where(
        and(
          eq(postsSchema.post.userId, userId),
          eq(postsSchema.post.image, seedPost.image),
        ),
      )
      .limit(1);

    if (row) postIdMap.set(i, row.id);
  }

  return postIdMap;
}

/**
 * Seeds likes and comments on existing posts.
 */
export async function seedInteractions(
  db: SeedDb,
  userIds: string[],
): Promise<{ likes: number; comments: number }> {
  console.log('Resolving post IDs for interactions...');
  const postIdMap = await resolvePostIds(db, userIds);

  // --- Likes ---
  console.log('Creating likes...');
  let likeCount = 0;

  for (const seedLike of SEED_LIKES) {
    const userId = userIds[seedLike.userIndex];
    const postId = postIdMap.get(seedLike.postIndex);
    if (!userId || !postId) continue;

    await db
      .insert(postsSchema.like)
      .values({ userId, postId })
      .onConflictDoNothing();
    likeCount++;
  }

  console.log(`  ${likeCount} likes created.`);

  // --- Comments ---
  console.log('Creating comments...');
  let commentCount = 0;

  for (const seedComment of SEED_COMMENTS) {
    const userId = userIds[seedComment.userIndex];
    const postId = postIdMap.get(seedComment.postIndex);
    if (!userId || !postId) continue;

    // Look up the post's createdAt to offset the comment timestamp
    const [post] = await db
      .select({ createdAt: postsSchema.post.createdAt })
      .from(postsSchema.post)
      .where(eq(postsSchema.post.id, postId))
      .limit(1);

    if (!post) continue;

    const createdAt = new Date(
      post.createdAt.getTime() +
        seedComment.hoursAfterPost * 60 * 60 * 1000,
    );

    await db.insert(commentSchema.comment).values({
      text: seedComment.text,
      userId,
      postId,
      createdAt,
    });
    commentCount++;
  }

  console.log(`  ${commentCount} comments created.`);

  return { likes: likeCount, comments: commentCount };
}