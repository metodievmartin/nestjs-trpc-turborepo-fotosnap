/**
 * Image copy helpers — copies seed images into the uploads directory.
 */

import * as fs from 'fs';
import * as path from 'path';

import { UPLOADS_DIR } from './db';
import { SEED_USERS } from '../data/users';
import { SEED_POSTS } from '../data/posts';
import { SEED_STORIES } from '../data/stories';

const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');
const AVATARS_DIR = path.join(ASSETS_DIR, 'avatars');
const POSTS_DIR = path.join(ASSETS_DIR, 'posts');
const STORIES_DIR = path.join(ASSETS_DIR, 'stories');

/**
 * Copies avatar images into uploads. Returns a map of email → avatar filename
 * for users whose avatar file was found.
 */
export function copyAvatars(): Map<string, string> {
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
      console.log(
        `  Avatar not found for ${seedUser.username}: ${seedUser.avatar}`,
      );
      continue;
    }
    const dest = path.join(UPLOADS_DIR, seedUser.avatar);
    fs.copyFileSync(src, dest);
    avatarMap.set(seedUser.email, seedUser.avatar);
  }

  return avatarMap;
}

export function copyPostImages(): void {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('  No posts directory found, skipping post image copy.');
    return;
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  for (const seedPost of SEED_POSTS) {
    const src = path.join(POSTS_DIR, seedPost.image);
    if (!fs.existsSync(src)) {
      console.log(`  Post image not found: ${seedPost.image}`);
      continue;
    }
    const dest = path.join(UPLOADS_DIR, seedPost.image);
    fs.copyFileSync(src, dest);
  }
}

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
