import { and, asc, eq, gt, inArray, sql } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  CreateStoryInput,
  NullableStoryGroup,
  PaginatedStoryGroups,
  Story,
  StoryGroup,
} from '@repo/contracts/stories';

import { user } from '../auth/schema';
import { story } from './schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';

type StoryWithUser = typeof story.$inferSelect & {
  user: typeof user.$inferSelect;
};

@Injectable()
export class StoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    createStoryInput: CreateStoryInput,
    userId: string,
  ): Promise<Story> {
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + 24);

    const [{ id }] = await this.database
      .insert(story)
      .values({
        userId,
        image: createStoryInput.image,
        expiresAt,
      })
      .returning({ id: story.id });

    const createdStory = await this.database.query.story.findFirst({
      where: eq(story.id, id),
      with: { user: true },
    });

    return this.toStory(createdStory!);
  }

  async getUserStories(userId: string): Promise<NullableStoryGroup> {
    const fetchedStories = await this.database.query.story.findMany({
      where: and(eq(story.userId, userId), gt(story.expiresAt, new Date())),
      orderBy: [asc(story.createdAt)],
      with: { user: true },
    });

    if (fetchedStories.length === 0) return null;

    return this.toStoryGroup(fetchedStories);
  }

  async getFeedStories(
    viewerId: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedStoryGroups> {
    const now = new Date();

    // Query 1: Get distinct users with active stories, paginated by max story id.
    // Uses raw SQL because Drizzle's query builder doesn't support GROUP BY + HAVING natively.
    // HAVING TRUE acts as a no-op when there's no cursor (avoids conditional SQL fragments).
    const cursorCondition = cursor
      ? sql`MAX(${story.id}) < ${Number(cursor)}`
      : sql`TRUE`;

    const result = await this.database.execute<{
      userId: string;
      max_story_id: number;
    }>(sql`
      SELECT ${story.userId} as "userId", MAX(${story.id}) as max_story_id
      FROM ${story}
      WHERE ${story.userId} != ${viewerId}
        AND ${story.expiresAt} > ${now}
      GROUP BY ${story.userId}
      HAVING ${cursorCondition}
      ORDER BY max_story_id DESC
      LIMIT ${limit + 1}
    `);
    const userGroups = result.rows;

    const hasMore = userGroups.length > limit;
    const pagedGroups = hasMore ? userGroups.slice(0, limit) : userGroups;

    if (pagedGroups.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    const userIds = pagedGroups.map((g) => g.userId);

    // Query 2: Fetch all stories for those users
    const fetchedStories = await this.database.query.story.findMany({
      where: and(inArray(story.userId, userIds), gt(story.expiresAt, now)),
      orderBy: [asc(story.createdAt)],
      with: { user: true },
    });

    // Group stories by user and re-order to match query 1's pagination order
    const grouped = Map.groupBy(fetchedStories, (s) => s.userId);
    const items = userIds
      .map((uid) => grouped.get(uid))
      .filter((stories) => stories && stories.length > 0)
      .map((stories) => this.toStoryGroup(stories!));

    const nextCursor = hasMore
      ? String(pagedGroups[pagedGroups.length - 1].max_story_id)
      : null;

    return { items, nextCursor, hasMore };
  }

  private toStoryGroup(fetchedStories: StoryWithUser[]): StoryGroup {
    const first = fetchedStories[0];

    return {
      userId: first.userId,
      username: first.user.name,
      avatar: first.user.image || '',
      stories: fetchedStories.map((s) => this.toStory(s)),
    };
  }

  private toStory(fetchedStory: StoryWithUser): Story {
    return {
      id: fetchedStory.id,
      user: {
        id: fetchedStory.user.id,
        username: fetchedStory.user.name,
        avatar: fetchedStory.user.image || '',
      },
      image: fetchedStory.image,
      createdAt: fetchedStory.createdAt.toISOString(),
      expiresAt: fetchedStory.expiresAt.toISOString(),
    };
  }
}
