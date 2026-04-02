import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, gt, lt, sql } from 'drizzle-orm';

import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { follow, user } from '../auth/schema';
import { feedPostItem, feedStoryItem } from './schemas/schema';
import {
  FEED_QUEUE,
  CELEBRITY_THRESHOLD,
  FAN_OUT_POST_JOB,
  FAN_OUT_STORY_JOB,
  BACKFILL_FOLLOW_JOB,
  CLEANUP_UNFOLLOW_JOB,
  CLEANUP_EXPIRED_STORIES_JOB,
  CLEANUP_ORPHANED_POSTS_JOB,
} from './feed.constants';
import { post } from '../posts/schemas/schema';
import { story } from '../stories/schemas/schema';

const BATCH_SIZE = 1000;

@Processor(FEED_QUEUE)
export class FeedProcessor extends WorkerHost {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case FAN_OUT_POST_JOB:
        return this.fanOutPost(job.data);
      case FAN_OUT_STORY_JOB:
        return this.fanOutStory(job.data);
      case BACKFILL_FOLLOW_JOB:
        return this.backfillFollow(job.data);
      case CLEANUP_UNFOLLOW_JOB:
        return this.cleanupUnfollow(job.data);
      case CLEANUP_EXPIRED_STORIES_JOB:
        return this.cleanupExpiredStories();
      case CLEANUP_ORPHANED_POSTS_JOB:
        return this.cleanupOrphanedPosts();
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async fanOutPost(data: {
    postId: number;
    userId: string;
    createdAt: string;
  }) {
    // Always insert a self-item so the author sees their own post in the feed
    await this.database.insert(feedPostItem).values({
      userId: data.userId,
      postId: data.postId,
      sourceUserId: data.userId,
      createdAt: new Date(data.createdAt),
    });

    const sourceUser = await this.database.query.user.findFirst({
      where: eq(user.id, data.userId),
      columns: { followerCount: true },
    });

    if (!sourceUser || sourceUser.followerCount >= CELEBRITY_THRESHOLD) {
      this.logger.log(
        `Skipping follower fan-out for post ${data.postId} (celebrity user)`,
      );
      return;
    }

    let lastFollowerId: string | undefined;
    let totalInserted = 0;

    while (true) {
      const conditions = [eq(follow.followingId, data.userId)];
      if (lastFollowerId) {
        conditions.push(
          sql`${follow.followerId} > ${lastFollowerId}` as ReturnType<
            typeof eq
          >,
        );
      }

      const followers = await this.database
        .select({ followerId: follow.followerId })
        .from(follow)
        .where(and(...conditions))
        .orderBy(follow.followerId)
        .limit(BATCH_SIZE);

      if (followers.length === 0) break;

      await this.database.insert(feedPostItem).values(
        followers.map((f) => ({
          userId: f.followerId,
          postId: data.postId,
          sourceUserId: data.userId,
          createdAt: new Date(data.createdAt),
        })),
      );

      totalInserted += followers.length;
      lastFollowerId = followers[followers.length - 1].followerId;

      if (followers.length < BATCH_SIZE) break;
    }

    this.logger.log(
      `Fan-out post ${data.postId} to ${totalInserted} followers + self`,
    );
  }

  private async fanOutStory(data: {
    storyId: number;
    userId: string;
    createdAt: string;
    expiresAt: string;
  }) {
    // Always insert a self-item so the author sees their own story in the feed
    await this.database.insert(feedStoryItem).values({
      userId: data.userId,
      storyId: data.storyId,
      sourceUserId: data.userId,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
    });

    const sourceUser = await this.database.query.user.findFirst({
      where: eq(user.id, data.userId),
      columns: { followerCount: true },
    });

    if (!sourceUser || sourceUser.followerCount >= CELEBRITY_THRESHOLD) {
      this.logger.log(
        `Skipping follower fan-out for story ${data.storyId} (celebrity user)`,
      );
      return;
    }

    let lastFollowerId: string | undefined;
    let totalInserted = 0;

    while (true) {
      const conditions = [eq(follow.followingId, data.userId)];
      if (lastFollowerId) {
        conditions.push(
          sql`${follow.followerId} > ${lastFollowerId}` as ReturnType<
            typeof eq
          >,
        );
      }

      const followers = await this.database
        .select({ followerId: follow.followerId })
        .from(follow)
        .where(and(...conditions))
        .orderBy(follow.followerId)
        .limit(BATCH_SIZE);

      if (followers.length === 0) break;

      await this.database.insert(feedStoryItem).values(
        followers.map((f) => ({
          userId: f.followerId,
          storyId: data.storyId,
          sourceUserId: data.userId,
          createdAt: new Date(data.createdAt),
          expiresAt: new Date(data.expiresAt),
        })),
      );

      totalInserted += followers.length;
      lastFollowerId = followers[followers.length - 1].followerId;

      if (followers.length < BATCH_SIZE) break;
    }

    this.logger.log(
      `Fan-out story ${data.storyId} to ${totalInserted} followers + self`,
    );
  }

  private async backfillFollow(data: {
    followerId: string;
    followingId: string;
  }) {
    // Check if followed user is a celebrity — if so, skip backfill (read-path handles it)
    const sourceUser = await this.database.query.user.findFirst({
      where: eq(user.id, data.followingId),
      columns: { followerCount: true },
    });

    if (!sourceUser || sourceUser.followerCount >= CELEBRITY_THRESHOLD) {
      this.logger.log(
        `Skipping backfill for follow ${data.followerId} → ${data.followingId} (celebrity)`,
      );
      return;
    }

    // Backfill existing posts from followed user
    const posts = await this.database
      .select({
        id: post.id,
        userId: post.userId,
        createdAt: post.createdAt,
      })
      .from(post)
      .where(eq(post.userId, data.followingId));

    if (posts.length > 0) {
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        const batch = posts.slice(i, i + BATCH_SIZE);
        await this.database
          .insert(feedPostItem)
          .values(
            batch.map((p) => ({
              userId: data.followerId,
              postId: p.id,
              sourceUserId: p.userId,
              createdAt: p.createdAt,
            })),
          )
          .onConflictDoNothing();
      }
    }

    // Backfill active stories from followed user
    const now = new Date();
    const activeStories = await this.database
      .select({
        id: story.id,
        userId: story.userId,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      })
      .from(story)
      .where(and(eq(story.userId, data.followingId), gt(story.expiresAt, now)));

    if (activeStories.length > 0) {
      await this.database
        .insert(feedStoryItem)
        .values(
          activeStories.map((s) => ({
            userId: data.followerId,
            storyId: s.id,
            sourceUserId: s.userId,
            createdAt: s.createdAt,
            expiresAt: s.expiresAt,
          })),
        )
        .onConflictDoNothing();
    }

    this.logger.log(
      `Backfilled follow ${data.followerId} → ${data.followingId}: ${posts.length} posts, ${activeStories.length} stories`,
    );
  }

  private async cleanupUnfollow(data: {
    followerId: string;
    unfollowedUserId: string;
  }) {
    const [postResult] = await this.database
      .delete(feedPostItem)
      .where(
        and(
          eq(feedPostItem.userId, data.followerId),
          eq(feedPostItem.sourceUserId, data.unfollowedUserId),
        ),
      )
      .returning({ id: feedPostItem.id });

    const [storyResult] = await this.database
      .delete(feedStoryItem)
      .where(
        and(
          eq(feedStoryItem.userId, data.followerId),
          eq(feedStoryItem.sourceUserId, data.unfollowedUserId),
        ),
      )
      .returning({ id: feedStoryItem.id });

    this.logger.log(
      `Cleaned up feed items for unfollow: ${data.followerId} → ${data.unfollowedUserId}`,
    );
  }

  private async cleanupExpiredStories() {
    const result = await this.database
      .delete(feedStoryItem)
      .where(lt(feedStoryItem.expiresAt, new Date()));

    this.logger.log('Cleaned up expired story feed items');
  }

  private async cleanupOrphanedPosts() {
    await this.database.execute(sql`
      DELETE FROM ${feedPostItem}
      WHERE NOT EXISTS (
        SELECT 1 FROM ${post} WHERE ${post.id} = ${feedPostItem.postId}
      )
    `);

    this.logger.log('Cleaned up orphaned post feed items');
  }
}
