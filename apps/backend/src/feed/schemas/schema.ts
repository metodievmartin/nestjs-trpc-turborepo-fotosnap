import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { user } from '../../auth/schema';
import { post } from '../../posts/schemas/schema';
import { story } from '../../stories/schemas/schema';

export const feedPostItem = pgTable(
  'feed_post_item',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    postId: integer('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    sourceUserId: text('source_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull(),
    publishedAt: timestamp('published_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('feed_post_item_userId_createdAt_id_idx').on(
      table.userId,
      table.createdAt,
      table.id,
    ),
    index('feed_post_item_sourceUserId_userId_idx').on(
      table.sourceUserId,
      table.userId,
    ),
  ],
);

export const feedPostItemRelations = relations(feedPostItem, ({ one }) => ({
  user: one(user, {
    fields: [feedPostItem.userId],
    references: [user.id],
    relationName: 'feedPostItemOwner',
  }),
  post: one(post, {
    fields: [feedPostItem.postId],
    references: [post.id],
  }),
  sourceUser: one(user, {
    fields: [feedPostItem.sourceUserId],
    references: [user.id],
    relationName: 'feedPostItemSource',
  }),
}));

export const feedStoryItem = pgTable(
  'feed_story_item',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    storyId: integer('story_id')
      .notNull()
      .references(() => story.id, { onDelete: 'cascade' }),
    sourceUserId: text('source_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull(),
    publishedAt: timestamp('published_at')
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [
    index('feed_story_item_userId_expiresAt_createdAt_id_idx').on(
      table.userId,
      table.expiresAt,
      table.createdAt,
      table.id,
    ),
    index('feed_story_item_sourceUserId_userId_idx').on(
      table.sourceUserId,
      table.userId,
    ),
    index('feed_story_item_expiresAt_idx').on(table.expiresAt),
  ],
);

export const feedStoryItemRelations = relations(feedStoryItem, ({ one }) => ({
  user: one(user, {
    fields: [feedStoryItem.userId],
    references: [user.id],
    relationName: 'feedStoryItemOwner',
  }),
  story: one(story, {
    fields: [feedStoryItem.storyId],
    references: [story.id],
  }),
  sourceUser: one(user, {
    fields: [feedStoryItem.sourceUserId],
    references: [user.id],
    relationName: 'feedStoryItemSource',
  }),
}));
