/**
 * Story seeding logic.
 */

import { inArray } from 'drizzle-orm';

import { SEED_STORIES } from '../data/stories';
import { type SeedDb, storiesSchema } from './db';

/**
 * Deletes existing stories for the given seed user IDs, then inserts
 * fresh stories with current timestamps.
 */
export async function seedStories(
  db: SeedDb,
  userIds: string[],
): Promise<number> {
  const seedUserIds = [
    ...new Set(SEED_STORIES.map((s) => userIds[s.userIndex]).filter(Boolean)),
  ];

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
      now.getTime() - seedStory.hoursAgo * 60 * 60 * 1000,
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
