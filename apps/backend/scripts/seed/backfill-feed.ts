/**
 * Feed backfill script — populates feed inbox tables and followerCount
 * for existing data.
 *
 * Usage:
 *   ts-node scripts/seed/backfill-feed.ts
 *
 * Requirements:
 *   - Postgres running (npm run db:up)
 *   - Migrations applied (npm run db:migrate)
 *   - Feed tables exist (feed_post_item, feed_story_item)
 */

import { createDb } from './lib/db';
import {
  updateFollowerCounts,
  backfillPostFeed,
  backfillStoryFeed,
} from './lib/backfill';

async function main() {
  const { pool, db } = createDb();

  console.log('Starting feed backfill...\n');

  await updateFollowerCounts(db);
  console.log('');
  await backfillPostFeed(db);
  console.log('');
  await backfillStoryFeed(db);

  console.log('\nBackfill complete!');

  await pool.end();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
