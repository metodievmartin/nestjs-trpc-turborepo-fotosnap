/**
 * Shared story seed data and insertion logic.
 * Used by both the main seed (seed.ts) and the standalone story seed (seed-stories.ts).
 */

import * as fs from 'fs';
import * as path from 'path';
import { inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as storiesSchema from '../../src/stories/schemas/schema';
import { UPLOADS_DIR } from './seed-data';

// Re-export SEED_USERS emails so seed-stories.ts can look up IDs
export { SEED_USERS } from './seed-data';

const STORIES_DIR = path.resolve(__dirname, 'stories');

// ---------------------------------------------------------------------------
// Seed stories — [userIndex, imageFilename, hoursAgo]
//
// hoursAgo controls how far back createdAt is set (0–20h range so all
// stories are still within the 24h expiry window). Lower = more recent.
//
// Users with stories: valentina(0), daniel(1), rowan(2), marco(3),
//                     jay(5), nina(7), elena(8)
// Users without: hannah, claire, toby, ryan, sam, priya, alex, mina
// ---------------------------------------------------------------------------

export interface SeedStory {
  userIndex: number;
  image: string;
  hoursAgo: number;
}

export const SEED_STORIES: SeedStory[] = [
  // valentina — 3 stories spread across the day
  { userIndex: 0, image: 'story-valentina-1.webp', hoursAgo: 18 },
  { userIndex: 0, image: 'story-valentina-2.webp', hoursAgo: 10 },
  { userIndex: 0, image: 'story-valentina-3.webp', hoursAgo: 2 },
  // daniel — 2 stories
  { userIndex: 1, image: 'story-daniel-1.webp', hoursAgo: 14 },
  { userIndex: 1, image: 'story-daniel-2.webp', hoursAgo: 6 },
  // rowan — 2 stories
  { userIndex: 2, image: 'story-rowan-1.webp', hoursAgo: 16 },
  { userIndex: 2, image: 'story-rowan-2.webp', hoursAgo: 8 },
  // marco — 2 stories
  { userIndex: 3, image: 'story-marco-1.webp', hoursAgo: 12 },
  { userIndex: 3, image: 'story-marco-2.webp', hoursAgo: 4 },
  // jay — 3 stories
  { userIndex: 5, image: 'story-jay-1.webp', hoursAgo: 20 },
  { userIndex: 5, image: 'story-jay-2.webp', hoursAgo: 11 },
  { userIndex: 5, image: 'story-jay-3.webp', hoursAgo: 3 },
  // nina — 2 stories
  { userIndex: 7, image: 'story-nina-1.webp', hoursAgo: 15 },
  { userIndex: 7, image: 'story-nina-2.webp', hoursAgo: 7 },
  // elena — 2 stories
  { userIndex: 8, image: 'story-elena-1.webp', hoursAgo: 13 },
  { userIndex: 8, image: 'story-elena-2.webp', hoursAgo: 5 },
];

export function copyStoryImages(): void {
  if (!fs.existsSync(STORIES_DIR)) {
    console.log('  No stories directory found, skipping story image copy.');
    return;
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  for (const seedStory of SEED_STORIES) {
    const src = path.join(STORIES_DIR, seedStory.image);
    if (!fs.existsSync(src)) {
      console.log(`  Story image not found: ${seedStory.image}`);
      continue;
    }
    const dest = path.join(UPLOADS_DIR, seedStory.image);
    fs.copyFileSync(src, dest);
  }
}

/**
 * Deletes existing stories for the given seed user IDs, then inserts
 * fresh stories with current timestamps.
 *
 * @param db - Drizzle database instance
 * @param userIds - Ordered array of user IDs matching SEED_USERS indexes
 * @returns Number of stories inserted
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedStories(db: NodePgDatabase<any>, userIds: string[]) {
  const seedUserIds = [
    ...new Set(SEED_STORIES.map((s) => userIds[s.userIndex]).filter(Boolean)),
  ];

  // Delete only stories belonging to seed users
  console.log('Deleting existing seed-user stories...');
  await db
    .delete(storiesSchema.story)
    .where(inArray(storiesSchema.story.userId, seedUserIds));

  console.log('Creating stories...');
  let storyCount = 0;

  for (const seedStory of SEED_STORIES) {
    const userId = userIds[seedStory.userIndex];
    if (!userId) continue;

    const now = new Date();
    const createdAt = new Date(
      now.getTime() - seedStory.hoursAgo * 60 * 60 * 1000
    );
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    await db.insert(storiesSchema.story).values({
      userId,
      image: seedStory.image,
      createdAt,
      expiresAt,
    });
    storyCount++;
  }

  console.log(`  ${storyCount} stories created.`);
  return storyCount;
}
