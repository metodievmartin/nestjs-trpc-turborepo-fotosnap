// =============================================================================
// Better Auth Schema — auto-generated, then committed as regular source code.
//
// How this file was created:
//   1. Created a standalone auth config at src/auth/auth.ts:
//        import { betterAuth } from 'better-auth';
//        import { drizzleAdapter } from 'better-auth/adapters/drizzle';
//        export const auth = betterAuth({
//          database: drizzleAdapter({}, { provider: 'pg' }),
//        });
//   2. Ran the Better Auth CLI to generate this Drizzle schema:
//        npx @better-auth/cli generate
//      The CLI read auth.ts, determined which tables better-auth requires
//      (user, session, account, verification), and output this file with
//      the Drizzle table definitions.
//   3. Generated and ran the SQL migration:
//        npm run db:generate   (drizzle-kit diffed this schema → SQL)
//        npm run db:migrate    (applied the SQL to Postgres)
//
// The auth.ts config used in step 1 is a minimal/standalone version. The real
// better-auth instance used at runtime is created in app.module.ts, where the
// actual Drizzle DB connection is injected via NestJS DI.
//
// If you add better-auth plugins that require new tables (e.g., twoFactor,
// organisation), you can either rerun `npx @better-auth/cli generate` or
// manually add the Drizzle table definitions here. After any schema change,
// run `npm run db:generate` and `npm run db:migrate` to update the database.
// =============================================================================

import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

import { post } from '../posts/schemas/schema';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  displayName: text('display_name'),
  bio: text('bio'),
  website: text('website'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const follow = pgTable(
  'follow',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => user.id),
    followingId: text('following_id')
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
  ],
);

export const followRelations = relations(follow, ({ one }) => ({
  follower: one(user, {
    fields: [follow.followerId],
    references: [user.id],
  }),
  following: one(user, {
    fields: [follow.followingId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  posts: many(post),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
