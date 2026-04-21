import { Inject, Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, WorkerOptions } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { schema } from '../../database/database.module';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { user } from '../../auth/schema';
import { feedPostItem, feedStoryItem } from '../schemas/schema';
import {
  FEED_FANOUT_QUEUE,
  CELEBRITY_THRESHOLD,
  FAN_OUT_POST_JOB,
  FAN_OUT_STORY_JOB,
} from '../feed.constants';
import { iterateFollowerIdsPaged, logWorkerEvent } from './shared';

// Decorators run before Nest DI, so worker options must come from process.env,
// not ConfigService. Read once at module load.
function getFanoutWorkerOptions(): Pick<
  WorkerOptions,
  'concurrency' | 'limiter'
> {
  const concurrency = Number(process.env.FEED_FANOUT_CONCURRENCY ?? 5);
  const max = Number(process.env.FEED_FANOUT_LIMITER_MAX ?? 50);
  const duration = Number(process.env.FEED_FANOUT_LIMITER_DURATION_MS ?? 1000);
  return {
    concurrency,
    limiter: { max, duration },
  };
}

type FanOutPostData = {
  postId: number;
  userId: string;
  createdAt: string;
};

type FanOutStoryData = {
  storyId: number;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

@Processor(FEED_FANOUT_QUEUE, getFanoutWorkerOptions())
export class FeedFanoutProcessor extends WorkerHost {
  private readonly logger = new Logger(FeedFanoutProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {
    super();
    const opts = getFanoutWorkerOptions();
    this.logger.log(
      `Listening on queue '${FEED_FANOUT_QUEUE}' (concurrency=${opts.concurrency}, limiter=${opts.limiter?.max}/${opts.limiter?.duration}ms)`,
    );
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case FAN_OUT_POST_JOB:
        return this.fanOutPost(job.data);
      case FAN_OUT_STORY_JOB:
        return this.fanOutStory(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async fanOutPost(data: FanOutPostData) {
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

    let totalInserted = 0;

    for await (const followerIds of iterateFollowerIdsPaged(
      this.database,
      data.userId,
    )) {
      await this.database.insert(feedPostItem).values(
        followerIds.map((followerId) => ({
          userId: followerId,
          postId: data.postId,
          sourceUserId: data.userId,
          createdAt: new Date(data.createdAt),
        })),
      );
      totalInserted += followerIds.length;
    }

    this.logger.log(
      `Fan-out post ${data.postId} to ${totalInserted} followers + self`,
    );
  }

  private async fanOutStory(data: FanOutStoryData) {
    // No self-insert for stories: the author's own story is served from the
    // dedicated "Your Story" UI affordance (queried directly from the `story`
    // table), so copying it into the inbox is pure write amplification.
    // Posts keep their self-insert — authors expect to see their own posts in
    // the Following feed.
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

    let totalInserted = 0;

    for await (const followerIds of iterateFollowerIdsPaged(
      this.database,
      data.userId,
    )) {
      await this.database.insert(feedStoryItem).values(
        followerIds.map((followerId) => ({
          userId: followerId,
          storyId: data.storyId,
          sourceUserId: data.userId,
          createdAt: new Date(data.createdAt),
          expiresAt: new Date(data.expiresAt),
        })),
      );
      totalInserted += followerIds.length;
    }

    this.logger.log(
      `Fan-out story ${data.storyId} to ${totalInserted} followers + self`,
    );
  }

  // Lifecycle logging — BullMQ detects stalls via its default
  // `stalledInterval: 30000` / `maxStalledCount: 1` (one stall re-queues).
  // We don't customise those; the listener just surfaces them.
  @OnWorkerEvent('active')
  onActive(job: Job) {
    logWorkerEvent(this.logger, 'active', FEED_FANOUT_QUEUE, job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    logWorkerEvent(this.logger, 'completed', FEED_FANOUT_QUEUE, job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    logWorkerEvent(this.logger, 'failed', FEED_FANOUT_QUEUE, job, {
      error: err.message,
    });
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    logWorkerEvent(this.logger, 'stalled', FEED_FANOUT_QUEUE, jobId);
  }
}
