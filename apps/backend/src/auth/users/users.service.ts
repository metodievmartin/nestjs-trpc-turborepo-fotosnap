import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, desc, eq, lt, ne, notInArray, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  type PaginatedUserPreviews,
  type UserPreview,
  type UpdateProfileInput,
  type UserProfile,
} from '@repo/contracts/users';

import { follow, user } from '../schema';
import { post } from '../../posts/schemas/schema';
import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../../database/database-errors';
import { UserFollowedEvent } from '../../feed/events/user-followed.event';
import { UserUnfollowedEvent } from '../../feed/events/user-unfollowed.event';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private previewSelect(currentUserId: string) {
    return {
      id: user.id,
      username: user.username,
      image: user.image,
      isFollowing: sql<boolean>`EXISTS(
        SELECT 1
        FROM ${follow} f
        WHERE f.follower_id = ${currentUserId}
          AND f.following_id = "user"."id"
      )`,
    };
  }

  private profileSelect(currentUserId: string) {
    return {
      ...this.previewSelect(currentUserId),
      displayName: user.displayName,
      bio: user.bio,
      website: user.website,
      followerCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${follow} f
        WHERE f.following_id = "user"."id"
      )`,
      followingCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${follow} f
        WHERE f.follower_id = "user"."id"
      )`,
      postCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${post} p
        WHERE p.user_id = "user"."id"
      )`,
    };
  }

  async findById(userId: string): Promise<typeof user.$inferSelect> {
    const foundUser = await this.database.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    try {
      const result = await this.database
        .insert(follow)
        .values({ followerId, followingId })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) {
        await this.database
          .update(user)
          .set({ followerCount: sql`${user.followerCount} + 1` })
          .where(eq(user.id, followingId));

        this.eventEmitter.emit(
          UserFollowedEvent.key,
          new UserFollowedEvent(followerId, followingId),
        );
      }
    } catch (e) {
      if (isForeignKeyViolation(e)) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }

    return { success: true };
  }

  async unfollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const result = await this.database
      .delete(follow)
      .where(
        and(
          eq(follow.followerId, followerId),
          eq(follow.followingId, followingId),
        ),
      )
      .returning();

    if (result.length > 0) {
      await this.database
        .update(user)
        .set({ followerCount: sql`GREATEST(${user.followerCount} - 1, 0)` })
        .where(eq(user.id, followingId));

      this.eventEmitter.emit(
        UserUnfollowedEvent.key,
        new UserUnfollowedEvent(followerId, followingId),
      );
    }

    return { success: true };
  }

  async getFollowers(
    userId: string,
    currentUserId: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedUserPreviews> {
    return this.paginateFollows(
      follow.followingId,
      follow.followerId,
      userId,
      currentUserId,
      cursor,
      limit,
    );
  }

  async getFollowing(
    userId: string,
    currentUserId: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedUserPreviews> {
    return this.paginateFollows(
      follow.followerId,
      follow.followingId,
      userId,
      currentUserId,
      cursor,
      limit,
    );
  }

  // Shared pagination logic for getFollowers / getFollowing.
  // filterColumn = the side we WHERE on (e.g. followingId for "who follows X")
  // joinColumn   = the other side, joined to user table and used as cursor tiebreaker
  private async paginateFollows(
    filterColumn: typeof follow.followingId | typeof follow.followerId,
    joinColumn: typeof follow.followerId | typeof follow.followingId,
    userId: string,
    currentUserId: string,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedUserPreviews> {
    const cursorCondition = cursor
      ? this.parseFollowCursor(cursor, joinColumn)
      : undefined;

    const where = cursorCondition
      ? and(eq(filterColumn, userId), cursorCondition)
      : eq(filterColumn, userId);

    const rows = await this.database
      .select({
        ...this.previewSelect(currentUserId),
        followCreatedAt: follow.createdAt,
        cursorId: joinColumn,
      })
      .from(follow)
      .innerJoin(user, eq(joinColumn, user.id))
      .where(where)
      .orderBy(desc(follow.createdAt), desc(joinColumn))
      .limit(limit + 1); // fetch one extra to detect if there's a next page

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    // Cursor format: "isoDate|userId" — see parseFollowCursor
    let nextCursor: string | null = null;
    if (hasMore) {
      const last = items[items.length - 1];
      nextCursor = `${last.followCreatedAt.toISOString()}|${last.cursorId}`;
    }

    return {
      items: items.map((row) => ({
        id: row.id,
        username: row.username,
        image: row.image,
        isFollowing: row.isFollowing,
      })),
      nextCursor,
      hasMore,
    };
  }

  // Parses a "createdAt|id" cursor into a compound WHERE condition.
  // Uses (createdAt, tiebreakColumn) ordering to handle timestamp ties.
  private parseFollowCursor(
    cursor: string,
    tiebreakColumn: typeof follow.followerId | typeof follow.followingId,
  ) {
    const parts = cursor.split('|');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid cursor format');
    }

    const [createdAtStr, id] = parts;
    const createdAt = new Date(createdAtStr);
    if (isNaN(createdAt.getTime())) {
      throw new BadRequestException('Invalid cursor format');
    }

    // Seek past the cursor: rows older than createdAt, OR same createdAt but smaller id.
    // drizzle's or() can return undefined when given no args; the guard is for type safety.
    const condition = or(
      lt(follow.createdAt, createdAt),
      and(eq(follow.createdAt, createdAt), lt(tiebreakColumn, id)),
    );

    if (!condition) {
      throw new BadRequestException('Invalid cursor format');
    }

    return condition;
  }

  async getSuggestedUsers(userId: string): Promise<UserPreview[]> {
    return this.database
      .select(this.previewSelect(userId))
      .from(user)
      .where(
        and(
          ne(user.id, userId),
          notInArray(
            user.id,
            this.database
              .select({ id: follow.followingId })
              .from(follow)
              .where(eq(follow.followerId, userId)),
          ),
        ),
      )
      .limit(6);
  }

  async getUserProfile(
    userId: string,
    currentUserId: string,
  ): Promise<UserProfile> {
    const result = await this.database
      .select(this.profileSelect(currentUserId))
      .from(user)
      .where(eq(user.id, userId));

    if (!result[0]) {
      throw new NotFoundException('User not found');
    }

    return result[0];
  }

  async getUserByUsername(
    username: string,
    currentUserId: string,
  ): Promise<UserProfile> {
    const result = await this.database
      .select(this.profileSelect(currentUserId))
      .from(user)
      .where(eq(user.username, username));

    if (!result[0]) {
      throw new NotFoundException('User not found');
    }

    return result[0];
  }

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    try {
      const updated = await this.database
        .update(user)
        .set(updates)
        .where(eq(user.id, userId))
        .returning();

      if (updated.length === 0) {
        throw new NotFoundException('User not found');
      }

      return { success: true };
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException('Username is already taken');
      }
      throw e;
    }
  }
}
