/**
 * Story seed — refreshes stories for seed users only.
 *
 * Usage:
 *   npm run db:seed:stories   (from apps/backend or repo root)
 *
 * This deletes existing stories for seed users (matched by email), then
 * re-inserts fresh ones with current timestamps. Stories from non-seed
 * users (e.g. your test account) are left untouched.
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { inArray } from 'drizzle-orm';

import * as authSchema from '../../src/auth/schema';
import * as postsSchema from '../../src/posts/schemas/schema';
import * as commentSchema from '../../src/comments/schemas/schema';
import * as storiesSchema from '../../src/stories/schemas/schema';
import { DATABASE_URL, SEED_USERS } from './seed-data';
import { SEED_STORIES, copyStoryImages, seedStories } from './story-data';

async function main() {
  console.log('Seeding stories...\n');

  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, {
    schema: {
      ...authSchema,
      ...postsSchema,
      ...commentSchema,
      ...storiesSchema,
    },
  });

  // --- Copy story images ---
  console.log('Copying story images...');
  copyStoryImages();
  console.log(`  ${SEED_STORIES.length} story images copied.\n`);

  // --- Look up seed user IDs by email ---
  const seedEmails = SEED_USERS.map((u) => u.email);
  const seedUserRows = await db
    .select({ id: authSchema.user.id, email: authSchema.user.email })
    .from(authSchema.user)
    .where(inArray(authSchema.user.email, seedEmails));

  if (seedUserRows.length === 0) {
    console.log('No seed users found. Run npm run db:seed first.');
    await pool.end();
    return;
  }

  const emailToId = new Map(seedUserRows.map((r) => [r.email, r.id]));
  const userIds = SEED_USERS.map((u) => emailToId.get(u.email) ?? '');

  // --- Delete existing seed-user stories, then insert fresh ones ---
  const storyCount = await seedStories(db, userIds);

  console.log('\nStory seed complete!');
  console.log(`  Stories: ${storyCount}\n`);

  await pool.end();
}

main().catch((err) => {
  console.error('Story seed failed:', err);
  process.exit(1);
});
