import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, ne, notInArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  type UserPreview,
  type UpdateProfileInput,
  type UserProfile,
} from '@repo/contracts/users';

import { follow, user } from '../schema';
import { post } from '../../posts/schemas/schema';
import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { isForeignKeyViolation } from '../../database/database-errors';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  private previewSelect(currentUserId: string) {
    return {
      id: user.id,
      name: user.name,
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
      await this.database
        .insert(follow)
        .values({ followerId, followingId })
        .onConflictDoNothing();
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

    await this.database
      .delete(follow)
      .where(
        and(
          eq(follow.followerId, followerId),
          eq(follow.followingId, followingId),
        ),
      );

    return { success: true };
  }

  async getFollowers(
    userId: string,
    currentUserId: string,
  ): Promise<UserPreview[]> {
    return this.database
      .select(this.previewSelect(currentUserId))
      .from(follow)
      .innerJoin(user, eq(follow.followerId, user.id))
      .where(eq(follow.followingId, userId));
  }

  async getFollowing(
    userId: string,
    currentUserId: string,
  ): Promise<UserPreview[]> {
    return this.database
      .select(this.previewSelect(currentUserId))
      .from(follow)
      .innerJoin(user, eq(follow.followingId, user.id))
      .where(eq(follow.followerId, userId));
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

  async updateProfile(userId: string, updates: UpdateProfileInput) {
    const updated = await this.database
      .update(user)
      .set(updates)
      .where(eq(user.id, userId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }
}
