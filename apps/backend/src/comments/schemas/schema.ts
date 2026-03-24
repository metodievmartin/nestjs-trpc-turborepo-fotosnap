import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { user } from '../../auth/schema';
import { post } from '../../posts/schemas/schema';
import { relations } from 'drizzle-orm';

export const comment = pgTable(
  'comment',
  {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    postId: integer('post_id')
      .notNull()
      .references(() => post.id),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [index('comment_postId_id_idx').on(table.postId, table.id)],
);

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
}));
