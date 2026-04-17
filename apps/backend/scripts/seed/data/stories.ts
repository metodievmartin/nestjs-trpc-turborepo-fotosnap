/**
 * Seed story data — pure data, no DB logic.
 *
 * hoursAgo controls how far back createdAt is set (0–20h range so all
 * stories are still within the 24h expiry window). Lower = more recent.
 *
 * Users with stories: valentina(0), daniel(1), rowan(2), marco(3),
 *                     jay(5), nina(7), elena(8), isla(15), yuna(16)
 * Users without: hannah, claire, toby, ryan, sam, priya, alex, mina,
 *                nils, kenji, leo, anya
 */

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
  // isla — 2 stories (recent, shows up first)
  { userIndex: 15, image: 'story-isla-1.webp', hoursAgo: 1.5 },
  { userIndex: 15, image: 'story-isla-2.webp', hoursAgo: 0.5 },
  // yuna — 2 stories
  { userIndex: 16, image: 'story-yuna-1.webp', hoursAgo: 9 },
  { userIndex: 16, image: 'story-yuna-2.webp', hoursAgo: 3 },
];
