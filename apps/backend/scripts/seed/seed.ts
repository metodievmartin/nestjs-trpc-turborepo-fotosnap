/**
 * Database seed script — creates 15 demo users with profiles, avatars,
 * partial follow relationships, and stories.
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

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import * as authSchema from '../../src/auth/schema';
import * as postsSchema from '../../src/posts/schemas/schema';
import * as commentSchema from '../../src/comments/schemas/schema';
import * as storiesSchema from '../../src/stories/schemas/schema';
import { SEED_USERS, DATABASE_URL, UPLOADS_DIR } from './seed-data';
import { SEED_STORIES, copyStoryImages, seedStories } from './story-data';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SEED_PASSWORD = 'password123';

const AVATARS_DIR = path.resolve(__dirname, 'avatars');

// ---------------------------------------------------------------------------
// Follow graph — sparse on purpose so suggested users works.
// Each entry: [followerIndex, followingIndex] (indexes into SEED_USERS)
//
// Cluster 1 (fashion/music/lifestyle): valentina, daniel, marco — tight-knit
// Cluster 2 (nature/outdoors): rowan, hannah, ryan — some overlap
// Cluster 3 (urban/creative): jay, nina, elena — loose ties
// Isolated-ish: claire, toby, sam, priya, alex.lifts, mina — few connections
// ---------------------------------------------------------------------------

const FOLLOW_PAIRS: [number, number][] = [
  // Cluster 1: valentina(0), daniel(1), marco(3)
  [0, 1], [1, 0], [0, 3], [3, 0], [1, 3],
  // Cluster 2: rowan(2), hannah(4), ryan(10)
  [2, 4], [4, 2], [10, 2], [10, 4],
  // Cluster 3: jay(5), nina(7), elena(8)
  [5, 7], [7, 5], [8, 5], [8, 7],
  // Cross-cluster bridges
  [0, 8],  // valentina follows elena (fashion meets golden-hour portraits)
  [1, 5],  // daniel follows jay (music meets urban creative)
  [4, 8],  // hannah follows elena (plants meets golden hour)
  // claire(6) and toby(9) — tech duo, few connections
  [6, 9], [9, 6],
  // sam(11) follows a handful but nobody follows back (lurker)
  [11, 0], [11, 3], [11, 8],
  // priya(12) — one mutual with rowan
  [12, 2], [2, 12],
  // alex.lifts(13) and mina(14) — completely isolated, zero follows
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyAvatars(): Map<string, string> {
  const avatarMap = new Map<string, string>();

  if (!fs.existsSync(AVATARS_DIR)) {
    console.log('  No avatars directory found, skipping avatar copy.');
    return avatarMap;
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  for (const seedUser of SEED_USERS) {
    if (!seedUser.avatar) continue;

    const src = path.join(AVATARS_DIR, seedUser.avatar);
    if (!fs.existsSync(src)) {
      console.log(`  Avatar not found for ${seedUser.name}: ${seedUser.avatar}`);
      continue;
    }
    const dest = path.join(UPLOADS_DIR, seedUser.avatar);
    fs.copyFileSync(src, dest);
    avatarMap.set(seedUser.email, seedUser.avatar);
  }

  return avatarMap;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Seeding database...\n');

  // --- DB connection ---
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, {
    schema: {
      ...authSchema,
      ...postsSchema,
      ...commentSchema,
      ...storiesSchema,
    },
  });

  // --- Better Auth instance (standalone, same config as app.module.ts) ---
  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    baseURL: 'http://localhost:4000',
    emailAndPassword: { enabled: true },
  });

  // --- Copy images ---
  console.log('Copying avatars...');
  const avatarMap = copyAvatars();
  console.log(`  ${avatarMap.size} avatars copied.`);

  console.log('Copying story images...');
  copyStoryImages();
  console.log(`  ${SEED_STORIES.length} story images copied.\n`);

  // --- Create users ---
  console.log('Creating users...');
  const userIds: string[] = [];

  for (const seedUser of SEED_USERS) {
    // Check if user already exists
    const existing = await db
      .select({ id: authSchema.user.id })
      .from(authSchema.user)
      .where(eq(authSchema.user.email, seedUser.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  Skipped (exists): ${seedUser.name}`);
      userIds.push(existing[0].id);
      continue;
    }

    // Create via Better Auth — this populates user + account tables
    const result = await auth.api.signUpEmail({
      body: {
        name: seedUser.name,
        email: seedUser.email,
        password: SEED_PASSWORD,
        image: avatarMap.get(seedUser.email) ?? undefined,
      },
    });

    const userId = result.user.id;
    userIds.push(userId);

    // Update profile fields that signUpEmail doesn't support
    await db
      .update(authSchema.user)
      .set({
        displayName: seedUser.displayName,
        bio: seedUser.bio,
        website: seedUser.website ?? null,
      })
      .where(eq(authSchema.user.id, userId));

    console.log(`  Created: ${seedUser.name} (${userId})`);
  }

  // --- Create follow relationships ---
  console.log('\nCreating follow relationships...');
  let followCount = 0;

  for (const [followerIdx, followingIdx] of FOLLOW_PAIRS) {
    const followerId = userIds[followerIdx];
    const followingId = userIds[followingIdx];

    try {
      await db
        .insert(authSchema.follow)
        .values({ followerId, followingId })
        .onConflictDoNothing();
      followCount++;
    } catch {
      // already exists — composite PK conflict
    }
  }

  console.log(`  ${followCount} follow relationships created.`);

  // --- Create stories (deletes existing seed-user stories first) ---
  console.log('');
  await seedStories(db, userIds);

  // --- Done ---
  console.log('\nSeed complete!');
  console.log(`  Users: ${SEED_USERS.length}`);
  console.log(`  Follow pairs: ${FOLLOW_PAIRS.length}`);
  console.log(`  Stories: ${SEED_STORIES.length}`);
  console.log(`  Password for all: ${SEED_PASSWORD}\n`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
