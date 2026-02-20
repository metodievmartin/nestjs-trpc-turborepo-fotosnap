// Drizzle Kit config — used only by the drizzle-kit CLI for migration management.
// This file is NOT imported at runtime by the app.
//
// Workflow after changing any schema.ts file:
//   npm run db:generate                          # diff schema → SQL migration
//   npm run db:generate -- --name my-migration   # same, with a custom migration name
//   npm run db:migrate                           # apply pending migrations to Postgres
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Glob that picks up all schema.ts files across the app (e.g., src/auth/schema.ts).
  // Add new schema files anywhere under src/ and they'll be discovered automatically.
  schema: './src/**/schema.ts',
  // Directory where generated SQL migrations and meta snapshots are stored.
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
