import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, gt, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  PaginatedStoryGroups,
  Story,
  StoryGroup,
} from '@repo/contracts/stories';

import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { follow, user } from '../../auth/schema';
import { story } from '../../stories/schemas/schema';
import { feedStoryItem } from '../schemas/schema';
import { CELEBRITY_THRESHOLD } from '../feed.constants';

type StoryWithUser = typeof story.$inferSelect & {
  user: typeof user.$inferSelect;
};

@Injectable()
export class StoryFeedBuilder {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async getStoryFeed(
    viewerId: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedStoryGroups> {
    const now = new Date();

    // 1. Get user groups from inbox (fan-out on write)
    const inboxGroups = await this.getInboxStoryGroups(
      viewerId,
      now,
      cursor,
      limit + 1,
    );

    // 2. Get user groups from celebrity pull (fan-out on read)
    const celebrityGroups = await this.getCelebrityStoryGroups(
      viewerId,
      now,
      cursor,
      limit + 1,
    );

    // 3. Merge and deduplicate by userId, sort by max story ID desc
    const mergedMap = new Map<string, { userId: string; maxStoryId: number }>();
    for (const group of [...inboxGroups, ...celebrityGroups]) {
      const existing = mergedMap.get(group.userId);
      if (!existing || group.maxStoryId > existing.maxStoryId) {
        mergedMap.set(group.userId, group);
      }
    }

    const merged = [...mergedMap.values()].sort(
      (a, b) => b.maxStoryId - a.maxStoryId,
    );

    const hasMore = merged.length > limit;
    const paged = merged.slice(0, limit);

    if (paged.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    // 4. Fetch all stories for the paged user IDs
    const userIds = paged.map((g) => g.userId);
    const fetchedStories = await this.database.query.story.findMany({
      where: and(inArray(story.userId, userIds), gt(story.expiresAt, now)),
      orderBy: [asc(story.createdAt)],
      with: { user: true },
    });

    // 5. Group stories by user and maintain order
    const grouped = Map.groupBy(fetchedStories, (s) => s.userId);
    const items = userIds
      .map((uid) => grouped.get(uid))
      .filter((stories) => stories && stories.length > 0)
      .map((stories) => this.toStoryGroup(stories!));

    const nextCursor = hasMore
      ? String(paged[paged.length - 1].maxStoryId)
      : null;

    return { items, nextCursor, hasMore };
  }

  private async getInboxStoryGroups(
    viewerId: string,
    now: Date,
    cursor: string | null | undefined,
    limit: number,
  ): Promise<{ userId: string; maxStoryId: number }[]> {
    const cursorCondition = cursor
      ? sql`MAX(${feedStoryItem.storyId}) < ${Number(cursor)}`
      : sql`TRUE`;

    const result = await this.database.execute<{
      userId: string;
      max_story_id: number;
    }>(sql`
      SELECT ${feedStoryItem.sourceUserId} as "userId",
             MAX(${feedStoryItem.storyId}) as max_story_id
      FROM ${feedStoryItem}
      WHERE ${feedStoryItem.userId} = ${viewerId}
        AND ${feedStoryItem.expiresAt} > ${now}
      GROUP BY ${feedStoryItem.sourceUserId}
      HAVING ${cursorCondition}
      ORDER BY max_story_id DESC
      LIMIT ${limit}
    `);

    return result.rows.map((r) => ({
      userId: r.userId,
      maxStoryId: Number(r.max_story_id),
    }));
  }

  private async getCelebrityStoryGroups(
    viewerId: string,
    now: Date,
    cursor: string | null | undefined,
    limit: number,
  ): Promise<{ userId: string; maxStoryId: number }[]> {
    // Find followed users who are celebrities
    const celebrityFollows = await this.database
      .select({ followingId: follow.followingId })
      .from(follow)
      .innerJoin(user, eq(follow.followingId, user.id))
      .where(
        and(
          eq(follow.followerId, viewerId),
          gte(user.followerCount, CELEBRITY_THRESHOLD),
        ),
      );

    if (celebrityFollows.length === 0) return [];

    const celebrityIds = celebrityFollows.map((f) => f.followingId);

    const cursorCondition = cursor
      ? sql`MAX(${story.id}) < ${Number(cursor)}`
      : sql`TRUE`;

    const result = await this.database.execute<{
      userId: string;
      max_story_id: number;
    }>(sql`
      SELECT ${story.userId} as "userId",
             MAX(${story.id}) as max_story_id
      FROM ${story}
      WHERE ${story.userId} IN ${celebrityIds}
        AND ${story.expiresAt} > ${now}
      GROUP BY ${story.userId}
      HAVING ${cursorCondition}
      ORDER BY max_story_id DESC
      LIMIT ${limit}
    `);

    return result.rows.map((r) => ({
      userId: r.userId,
      maxStoryId: Number(r.max_story_id),
    }));
  }

  private toStoryGroup(fetchedStories: StoryWithUser[]): StoryGroup {
    const first = fetchedStories[0];
    return {
      userId: first.userId,
      username: first.user.username,
      avatar: first.user.image || '',
      stories: fetchedStories.map((s) => this.toStory(s)),
    };
  }

  private toStory(fetchedStory: StoryWithUser): Story {
    return {
      id: fetchedStory.id,
      user: {
        id: fetchedStory.user.id,
        username: fetchedStory.user.username,
        avatar: fetchedStory.user.image || '',
      },
      image: fetchedStory.image,
      createdAt: fetchedStory.createdAt.toISOString(),
      expiresAt: fetchedStory.expiresAt.toISOString(),
    };
  }
}
