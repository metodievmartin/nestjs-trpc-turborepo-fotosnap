import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lt,
  or,
  sql,
  InferSelectModel,
} from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PaginatedPosts, Post } from '@repo/contracts/posts';

import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { follow, user } from '../../auth/schema';
import { post } from '../../posts/schemas/schema';
import { like } from '../../posts/schemas/schema';
import { comment } from '../../comments/schemas/schema';
import { feedPostItem } from '../schemas/schema';
import { CELEBRITY_THRESHOLD } from '../feed.constants';
import { RANKING_STRATEGY } from '../ranking/ranking-strategy.interface';
import type { RankingStrategy } from '../ranking/ranking-strategy.interface';

type PostWithRelations = InferSelectModel<typeof post> & {
  user: InferSelectModel<typeof user>;
  likes: InferSelectModel<typeof like>[];
  comments: InferSelectModel<typeof comment>[];
};

interface RankablePost {
  createdAt: Date;
  id: number;
  postId: number;
}

@Injectable()
export class PostFeedBuilder {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    @Inject(RANKING_STRATEGY)
    private readonly ranking: RankingStrategy<RankablePost>,
  ) {}

  async getPostFeed(
    userId: string,
    cursor?: string | null,
    limit = 10,
  ): Promise<PaginatedPosts> {
    const parsedCursor = cursor ? this.parseCursor(cursor) : null;

    // 1. Get post IDs from inbox (fan-out on write items)
    const inboxItems = await this.getInboxPostIds(
      userId,
      parsedCursor,
      limit + 1,
    );

    // 2. Get post IDs from celebrity pull (fan-out on read)
    const celebrityItems = await this.getCelebrityPostIds(
      userId,
      parsedCursor,
      limit + 1,
    );

    // 3. Merge and rank
    const merged = this.ranking.rank([...inboxItems, ...celebrityItems]);
    const hasMore = merged.length > limit;
    const paged = merged.slice(0, limit);

    if (paged.length === 0) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    // 4. Hydrate with full post data
    const postIds = paged.map((item) => item.postId);
    const posts = await this.hydratePosts(postIds, userId);

    // Maintain the ranked order
    const postMap = new Map(posts.map((p) => [p.id, p]));
    const items = postIds
      .map((id) => postMap.get(id))
      .filter((p): p is Post => p !== undefined);

    const nextCursor = hasMore
      ? `${paged[paged.length - 1].createdAt.toISOString()}|${paged[paged.length - 1].postId}`
      : null;

    return { items, nextCursor, hasMore };
  }

  private async getInboxPostIds(
    userId: string,
    cursor: { createdAt: Date; id: number } | null,
    limit: number,
  ): Promise<RankablePost[]> {
    const conditions = [eq(feedPostItem.userId, userId)];

    if (cursor) {
      const cursorCond = or(
        lt(feedPostItem.createdAt, cursor.createdAt),
        and(
          eq(feedPostItem.createdAt, cursor.createdAt),
          lt(feedPostItem.postId, cursor.id),
        ),
      );
      if (cursorCond) conditions.push(cursorCond);
    }

    const rows = await this.database
      .select({
        postId: feedPostItem.postId,
        createdAt: feedPostItem.createdAt,
        id: feedPostItem.postId,
      })
      .from(feedPostItem)
      .where(and(...conditions))
      .orderBy(desc(feedPostItem.createdAt), desc(feedPostItem.postId))
      .limit(limit);

    return rows;
  }

  private async getCelebrityPostIds(
    userId: string,
    cursor: { createdAt: Date; id: number } | null,
    limit: number,
  ): Promise<RankablePost[]> {
    // Find followed users who are celebrities
    const celebrityFollows = await this.database
      .select({ followingId: follow.followingId })
      .from(follow)
      .innerJoin(user, eq(follow.followingId, user.id))
      .where(
        and(
          eq(follow.followerId, userId),
          gte(user.followerCount, CELEBRITY_THRESHOLD),
        ),
      );

    if (celebrityFollows.length === 0) return [];

    const celebrityIds = celebrityFollows.map((f) => f.followingId);

    const conditions = [inArray(post.userId, celebrityIds)];

    if (cursor) {
      const cursorCond = or(
        lt(post.createdAt, cursor.createdAt),
        and(eq(post.createdAt, cursor.createdAt), lt(post.id, cursor.id)),
      );
      if (cursorCond) conditions.push(cursorCond);
    }

    const rows = await this.database
      .select({
        postId: post.id,
        createdAt: post.createdAt,
        id: post.id,
      })
      .from(post)
      .where(and(...conditions))
      .orderBy(desc(post.createdAt), desc(post.id))
      .limit(limit);

    return rows;
  }

  private async hydratePosts(
    postIds: number[],
    userId: string,
  ): Promise<Post[]> {
    if (postIds.length === 0) return [];

    const posts = await this.database.query.post.findMany({
      with: {
        user: true,
        likes: true,
        comments: true,
      },
      where: inArray(post.id, postIds),
    });

    return posts.map((savedPost) => this.mapToPost(savedPost, userId));
  }

  private mapToPost(savedPost: PostWithRelations, userId: string): Post {
    return {
      id: savedPost.id,
      user: {
        id: savedPost.user.id,
        username: savedPost.user.username,
        avatar: savedPost.user.image || '',
      },
      image: savedPost.image,
      caption: savedPost.caption,
      likes: savedPost.likes.length,
      comments: savedPost.comments.length,
      timestamp: savedPost.createdAt.toISOString(),
      isLiked: savedPost.likes.some((l) => l.userId === userId),
    };
  }

  private parseCursor(cursor: string): { createdAt: Date; id: number } {
    const parts = cursor.split('|');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid cursor format');
    }
    const [createdAtStr, idStr] = parts;
    const createdAt = new Date(createdAtStr);
    const id = Number(idStr);
    if (isNaN(createdAt.getTime()) || isNaN(id)) {
      throw new BadRequestException('Invalid cursor format');
    }
    return { createdAt, id };
  }
}
