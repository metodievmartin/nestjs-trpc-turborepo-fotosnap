/**
 * Database seed script — creates 15 demo users with profiles, avatars,
 * and partial follow relationships.
 *
 * Usage:
 *   npm run db:seed          (from apps/backend or repo root)
 *
 * Requirements:
 *   - Postgres running (npm run db:up)
 *   - Migrations applied (npm run db:migrate)
 *
 * The script is idempotent — existing users (matched by email) are skipped.
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

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/fotosnap?schema=public';

const SEED_PASSWORD = 'password123';

const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'images');
const AVATARS_DIR = path.resolve(__dirname, 'avatars');

// ---------------------------------------------------------------------------
// Seed users — 11 with avatars, 4 without (to test missing-avatar states)
//
// Bios hint at the kind of posts each user would share, so future seed
// content (posts, stories) can stay consistent with their persona.
// ---------------------------------------------------------------------------

interface SeedUser {
  name: string;
  email: string;
  displayName: string;
  bio: string;
  website?: string;
  avatar: string; // filename in avatars/ directory, empty string for no photo
}

const SEED_USERS: SeedUser[] = [
  // ---- f-1: Glam blonde, plaid blazer — fashion & beauty ----
  {
    name: 'valentina.style',
    email: 'valentina.style@fotosnap.dev',
    displayName: 'Valentina Reyes',
    bio: 'Fashion & beauty. Outfit inspo, runway recaps, and glam tutorials.',
    website: 'https://valentinastyle.co',
    avatar: 'user-profile-f-1.webp',
  },
  // ---- m-2: Curly hair, beard, B&W artistic shot — musician ----
  {
    name: 'daniel.crvz',
    email: 'daniel.crvz@fotosnap.dev',
    displayName: 'Daniel Cruz',
    bio: 'Songwriter & producer. Studio sessions, late-night jams, vinyl finds.',
    website: 'https://danielcrvz.music',
    avatar: 'user-profile-m-2.webp',
  },
  // ---- f-3: Red curls, meadow, eyes closed — wellness & nature ----
  {
    name: 'rowan.wild',
    email: 'rowan.wild@fotosnap.dev',
    displayName: 'Rowan Gallagher',
    bio: 'Herbal tea, forest bathing, slow mornings. Wellness through nature.',
    avatar: 'user-profile-f-3.webp',
  },
  // ---- m-4: Clean-cut, warm smile, travel mug — travel & lifestyle ----
  {
    name: 'marco.ventures',
    email: 'marco.ventures@fotosnap.dev',
    displayName: 'Marco Silva',
    bio: 'Coffee shops around the world. City guides, hidden gems, travel diaries.',
    website: 'https://marcoventures.com',
    avatar: 'user-profile-m-4.webp',
  },
  // ---- f-5: Blonde among tropical plants — botany & green living ----
  {
    name: 'hannah.bloom',
    email: 'hannah.bloom@fotosnap.dev',
    displayName: 'Hannah Lindqvist',
    bio: 'Plant mom. Botanical gardens, indoor jungles, propagation tips.',
    avatar: 'user-profile-f-5.webp',
  },
  // ---- m-6: Orange beanie, turtleneck, rooftop city view — urban creative ----
  {
    name: 'jay.onthe.roof',
    email: 'jay.onthe.roof@fotosnap.dev',
    displayName: 'Jay Okonkwo',
    bio: 'Rooftop views, street style, city textures. London creative.',
    website: 'https://jayontheroof.com',
    avatar: 'user-profile-m-6.webp',
  },
  // ---- f-7: Brunette, grey blazer, office building — career & tech ----
  {
    name: 'claire.builds',
    email: 'claire.builds@fotosnap.dev',
    displayName: 'Claire Nakamura',
    bio: 'Building things on the internet. Startup life, design thinking, side projects.',
    avatar: 'user-profile-f-7.webp',
  },
  // ---- f-8: Brunette, brick wall, natural look — film & indie ----
  {
    name: 'nina.analog',
    email: 'nina.analog@fotosnap.dev',
    displayName: 'Nina Kowalski',
    bio: 'Film photography, zines, thrift finds, indie playlists.',
    avatar: 'user-profile-f-8.webp',
  },
  // ---- f-9: Striped shirt, golden hour, direct gaze — portrait & light ----
  {
    name: 'elena.dusk',
    email: 'elena.dusk@fotosnap.dev',
    displayName: 'Elena Vasquez',
    bio: 'Chasing golden hour. Portraits, warm tones, magic-hour landscapes.',
    website: 'https://elenadusk.photo',
    avatar: 'user-profile-f-9.webp',
  },
  // ---- m-10: Blonde, glasses, reddish beard — tech & gaming ----
  {
    name: 'toby.codes',
    email: 'toby.codes@fotosnap.dev',
    displayName: 'Toby Engström',
    bio: 'Developer by day, gamer by night. Mechanical keyboards, home-lab setups.',
    website: 'https://tobycodes.dev',
    avatar: 'user-profile-m-10.webp',
  },
  // ---- m-11: Dark hair, beard, night road, warm smile — outdoors & adventure ----
  {
    name: 'ryan.trails',
    email: 'ryan.trails@fotosnap.dev',
    displayName: 'Ryan Beckett',
    bio: 'Hiking, camping, campfire cooking. National parks and backroads.',
    avatar: 'user-profile-m-11.webp',
  },
  // ---- No avatar: lurker / new account ----
  {
    name: 'sam.quiet',
    email: 'sam.quiet@fotosnap.dev',
    displayName: 'Sam Almeida',
    bio: 'Just here to scroll.',
    avatar: '',
  },
  // ---- No avatar: foodie who hasn't set up profile yet ----
  {
    name: 'priya.eats',
    email: 'priya.eats@fotosnap.dev',
    displayName: 'Priya Sharma',
    bio: 'Home cook. Recipe experiments, farmers market hauls, weekend bakes.',
    avatar: '',
  },
  // ---- No avatar: fitness, hasn't uploaded a pic ----
  {
    name: 'alex.lifts',
    email: 'alex.lifts@fotosnap.dev',
    displayName: 'Alex Petrov',
    bio: 'Calisthenics, meal prep, recovery routines.',
    avatar: '',
  },
  // ---- No avatar: bookworm ----
  {
    name: 'mina.reads',
    email: 'mina.reads@fotosnap.dev',
    displayName: 'Mina Torres',
    bio: 'Book reviews, reading nooks, annotated pages.',
    avatar: '',
  },
];

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

  // --- Copy avatars ---
  console.log('Copying avatars...');
  const avatarMap = copyAvatars();
  console.log(`  ${avatarMap.size} avatars copied.\n`);

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

  // --- Done ---
  console.log('\nSeed complete!');
  console.log(`  Users: ${SEED_USERS.length}`);
  console.log(`  Follow pairs: ${FOLLOW_PAIRS.length}`);
  console.log(`  Password for all: ${SEED_PASSWORD}\n`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});