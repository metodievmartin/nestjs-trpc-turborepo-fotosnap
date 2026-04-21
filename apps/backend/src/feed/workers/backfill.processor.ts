import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, WorkerOptions } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, gt } from 'drizzle-orm';

import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { user } from '../../auth/schema';
import { feedPostItem, feedStoryItem } from '../schemas/schema';
import {
  FEED_BACKFILL_QUEUE,
  CELEBRITY_THRESHOLD,
  BACKFILL_FOLLOW_JOB,
} from '../feed.constants';
import { post } from '../../posts/schemas/schema';
import { story } from '../../stories/schemas/schema';
import { BATCH_SIZE } from './shared';

function getBackfillWorkerOptions(): Pick<WorkerOptions, 'concurrency'> {
  const concurrency = Number(process.env.FEED_BACKFILL_CONCURRENCY ?? 2);
  return { concurrency };
}

type BackfillFollowData = {
  followerId: string;
  followingId: string;
};

@Processor(FEED_BACKFILL_QUEUE, getBackfillWorkerOptions())
export class FeedBackfillProcessor extends WorkerHost {
  private readonly logger = new Logger(FeedBackfillProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {
    super();
    const opts = getBackfillWorkerOptions();
    this.logger.log(
      `Listening on queue '${FEED_BACKFILL_QUEUE}' (concurrency=${opts.concurrency})`,
    );
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case BACKFILL_FOLLOW_JOB:
        return this.backfillFollow(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async backfillFollow(data: BackfillFollowData) {
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
}
