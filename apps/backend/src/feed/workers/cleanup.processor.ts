import { Inject, Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, WorkerOptions } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, lt, sql } from 'drizzle-orm';

import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { feedPostItem, feedStoryItem } from '../schemas/schema';
import { post } from '../../posts/schemas/schema';
import {
  FEED_CLEANUP_QUEUE,
  CLEANUP_UNFOLLOW_JOB,
  CLEANUP_EXPIRED_STORIES_JOB,
  CLEANUP_ORPHANED_POSTS_JOB,
} from '../feed.constants';
import { logWorkerEvent } from './shared';

function getCleanupWorkerOptions(): Pick<WorkerOptions, 'concurrency'> {
  const concurrency = Number(process.env.FEED_CLEANUP_CONCURRENCY ?? 1);
  return { concurrency };
}

type CleanupUnfollowData = {
  followerId: string;
  unfollowedUserId: string;
};

@Processor(FEED_CLEANUP_QUEUE, getCleanupWorkerOptions())
export class FeedCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(FeedCleanupProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {
    super();
    const opts = getCleanupWorkerOptions();
    this.logger.log(
      `Listening on queue '${FEED_CLEANUP_QUEUE}' (concurrency=${opts.concurrency})`,
    );
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
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

  private async cleanupUnfollow(data: CleanupUnfollowData) {
    await this.database
      .delete(feedPostItem)
      .where(
        and(
          eq(feedPostItem.userId, data.followerId),
          eq(feedPostItem.sourceUserId, data.unfollowedUserId),
        ),
      );

    await this.database
      .delete(feedStoryItem)
      .where(
        and(
          eq(feedStoryItem.userId, data.followerId),
          eq(feedStoryItem.sourceUserId, data.unfollowedUserId),
        ),
      );

    this.logger.log(
      `Cleaned up feed items for unfollow: ${data.followerId} → ${data.unfollowedUserId}`,
    );
  }

  private async cleanupExpiredStories() {
    await this.database
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

  @OnWorkerEvent('active')
  onActive(job: Job) {
    logWorkerEvent(this.logger, 'active', FEED_CLEANUP_QUEUE, job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    logWorkerEvent(this.logger, 'completed', FEED_CLEANUP_QUEUE, job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    logWorkerEvent(this.logger, 'failed', FEED_CLEANUP_QUEUE, job, {
      error: err.message,
    });
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    logWorkerEvent(this.logger, 'stalled', FEED_CLEANUP_QUEUE, jobId);
  }
}
