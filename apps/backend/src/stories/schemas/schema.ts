import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';

import { user } from '../../auth/schema';

export const story = pgTable(
  'story',
  {
    id: serial('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    image: text('image').notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [
    index('story_expiresAt_userId_idx').on(table.expiresAt, table.userId),
  ],
);

export const storyRelations = relations(story, ({ one }) => ({
  user: one(user, {
    fields: [story.userId],
    references: [user.id],
  }),
}));
