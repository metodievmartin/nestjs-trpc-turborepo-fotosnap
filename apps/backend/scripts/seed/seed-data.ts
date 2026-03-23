/**
 * Shared seed data and config. Imported by seed.ts, story-data.ts, and seed-stories.ts.
 */

import * as path from 'path';

// ---------------------------------------------------------------------------
// Shared config
// ---------------------------------------------------------------------------

export const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/fotosnap?schema=public';

export const UPLOADS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'uploads',
  'images'
);

// ---------------------------------------------------------------------------
// Seed users
// ---------------------------------------------------------------------------

export interface SeedUser {
  name: string;
  email: string;
  displayName: string;
  bio: string;
  website?: string;
  avatar: string; // filename in avatars/ directory, empty string for no photo
}

export const SEED_USERS: SeedUser[] = [
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
