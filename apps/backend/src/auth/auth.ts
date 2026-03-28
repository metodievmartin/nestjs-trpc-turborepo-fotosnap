// Standalone Better Auth config used only for CLI schema generation:
//   npx @better-auth/cli generate
// This is NOT the runtime auth instance. The real one is created in
// app.module.ts with the actual Drizzle DB connection injected via NestJS DI.
// If you add plugins here (e.g., twoFactor()), rerun the CLI to regenerate
// the schema in schema.ts.
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter({}, { provider: 'pg' }),
  user: {
    fields: {
      name: 'username',
    },
    additionalFields: {
      displayName: {
        type: 'string',
        required: false,
        fieldName: 'display_name',
      },
      bio: {
        type: 'string',
        required: false,
      },
      website: {
        type: 'string',
        required: false,
      },
    },
  },
});
