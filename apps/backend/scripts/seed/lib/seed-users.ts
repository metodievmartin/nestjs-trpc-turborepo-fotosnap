/**
 * User and follow relationship seeding logic.
 */

import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { SEED_USERS, FOLLOW_PAIRS } from '../data/users';
import { type SeedDb, authSchema, SEED_PASSWORD } from './db';

/**
 * Creates seed users via Better Auth sign-up. Existing users (by email) are
 * skipped. Returns an ordered array of user IDs matching SEED_USERS indexes.
 */
export async function seedUsers(
  db: SeedDb,
  avatarMap: Map<string, string>,
): Promise<string[]> {
  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    baseURL: 'http://localhost:4000',
    emailAndPassword: { enabled: true },
    user: {
      fields: { name: 'username' },
      additionalFields: {
        displayName: {
          type: 'string',
          required: false,
          fieldName: 'display_name',
        },
        bio: { type: 'string', required: false },
        website: { type: 'string', required: false },
      },
    },
  });

  console.log('Creating users...');
  const userIds: string[] = [];

  for (const seedUser of SEED_USERS) {
    const existing = await db
      .select({ id: authSchema.user.id })
      .from(authSchema.user)
      .where(eq(authSchema.user.email, seedUser.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  Skipped (exists): ${seedUser.username}`);
      userIds.push(existing[0].id);
      continue;
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: seedUser.username,
        email: seedUser.email,
        password: SEED_PASSWORD,
        image: avatarMap.get(seedUser.email) ?? undefined,
      },
    });

    const userId = result.user.id;
    userIds.push(userId);

    await db
      .update(authSchema.user)
      .set({
        displayName: seedUser.displayName,
        bio: seedUser.bio,
        website: seedUser.website ?? null,
      })
      .where(eq(authSchema.user.id, userId));

    console.log(`  Created: ${seedUser.username} (${userId})`);
  }

  return userIds;
}

/**
 * Creates follow relationships between seed users.
 */
export async function seedFollows(
  db: SeedDb,
  userIds: string[],
): Promise<number> {
  console.log('Creating follow relationships...');
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
  return followCount;
}
