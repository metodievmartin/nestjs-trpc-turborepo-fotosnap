/**
 * Database seed script — creates demo users with profiles, avatars,
 * follow relationships, posts, and stories.
 *
 * Usage:
 *   npm run db:seed          (from apps/backend or repo root)
 *
 * Requirements:
 *   - Postgres running (npm run db:up)
 *   - Migrations applied (npm run db:migrate)
 *
 * The script is idempotent — existing users (matched by email) are skipped.
 * Stories for seed users are deleted and re-inserted with fresh timestamps.
 * All seed users share the password: password123
 */

import { SEED_USERS, FOLLOW_PAIRS } from './data/users';
import { SEED_POSTS } from './data/posts';
import { SEED_STORIES } from './data/stories';
import { SEED_LIKES, SEED_COMMENTS } from './data/interactions';

import { createDb, SEED_PASSWORD } from './lib/db';
import { copyAvatars, copyPostImages, copyStoryImages } from './lib/images';
import { seedUsers, seedFollows } from './lib/seed-users';
import { seedPosts } from './lib/seed-posts';
import { seedStories } from './lib/seed-stories';
import { seedInteractions } from './lib/seed-interactions';
import {
  updateFollowerCounts,
  backfillPostFeed,
  backfillStoryFeed,
} from './lib/backfill';

async function seed() {
  console.log('Seeding database...\n');

  const { pool, db } = createDb();

  // --- Copy images ---
  console.log('Copying avatars...');
  const avatarMap = copyAvatars();
  console.log(`  ${avatarMap.size} avatars copied.`);

  console.log('Copying story images...');
  copyStoryImages();
  console.log(`  ${SEED_STORIES.length} story images copied.`);

  console.log('Copying post images...');
  copyPostImages();
  console.log(`  ${SEED_POSTS.length} post images copied.\n`);

  // --- Create users ---
  const userIds = await seedUsers(db, avatarMap);

  // --- Create follow relationships ---
  await seedFollows(db, userIds);

  // --- Create posts ---
  await seedPosts(db, userIds);

  // --- Create likes & comments ---
  await seedInteractions(db, userIds);

  // --- Create stories ---
  await seedStories(db, userIds);

  // --- Backfill feed tables ---
  await updateFollowerCounts(db);
  await backfillPostFeed(db);
  await backfillStoryFeed(db);

  // --- Done ---
  console.log('\nSeed complete!');
  console.log(`  Users: ${SEED_USERS.length}`);
  console.log(`  Follow pairs: ${FOLLOW_PAIRS.length}`);
  console.log(`  Posts: ${SEED_POSTS.length}`);
  console.log(`  Likes: ${SEED_LIKES.length}`);
  console.log(`  Comments: ${SEED_COMMENTS.length}`);
  console.log(`  Stories: ${SEED_STORIES.length}`);
  console.log(`  Password for all: ${SEED_PASSWORD}\n`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
