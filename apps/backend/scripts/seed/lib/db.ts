/**
 * Shared database connection and config for seed scripts.
 */

import * as path from 'path';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as authSchema from '../../../src/auth/schema';
import * as postsSchema from '../../../src/posts/schemas/schema';
import * as commentSchema from '../../../src/comments/schemas/schema';
import * as storiesSchema from '../../../src/stories/schemas/schema';
import * as feedSchema from '../../../src/feed/schemas/schema';

export const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/fotosnap?schema=public';

export const UPLOADS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'uploads',
  'images',
);

export const SEED_PASSWORD = 'password123';

export const schema = {
  ...authSchema,
  ...postsSchema,
  ...commentSchema,
  ...storiesSchema,
  ...feedSchema,
};

export { authSchema, postsSchema, commentSchema, storiesSchema, feedSchema };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SeedDb = NodePgDatabase<any>;

export function createDb(): { pool: Pool; db: SeedDb } {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });
  return { pool, db };
}
