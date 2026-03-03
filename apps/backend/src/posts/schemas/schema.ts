import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { user } from '../../auth/schema';
import { comment } from '../../comments/schemas/schema';

export const post = pgTable('post', {
  id: serial('id').primaryKey(),
  image: text('image').notNull(),
  caption: text('caption').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  // .references() adds a FK constraint inline - fine for simple cases.
  // For circular refs between tables, use the `foreignKeys` option in pgTable instead.
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
});

// Relations are Drizzle's query-layer abstraction - they don't affect the DB schema.
// They enable the relational query API (db.query.post.findMany({ with: { user: true } }))
// and are required on both sides for joins to work in that API.
export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    // `fields` = FK column(s) on this table, `references` = PK column(s) on the other table.
    fields: [post.userId],
    references: [user.id],
  }),
  likes: many(like),
  comments: many(comment),
}));

export const like = pgTable('like', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  postId: integer('post_id')
    .notNull()
    .references(() => post.id),
});

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, {
    fields: [like.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [like.postId],
    references: [post.id],
  }),
}));
