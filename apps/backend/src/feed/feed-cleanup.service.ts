import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import {
  FEED_CLEANUP_QUEUE,
  CLEANUP_EXPIRED_STORIES_JOB,
  CLEANUP_ORPHANED_POSTS_JOB,
} from './feed.constants';

@Injectable()
export class FeedCleanupService implements OnModuleInit {
  private readonly logger = new Logger(FeedCleanupService.name);

  constructor(
    @InjectQueue(FEED_CLEANUP_QUEUE) private readonly feedQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.feedQueue.add(
      CLEANUP_EXPIRED_STORIES_JOB,
      {},
      {
        repeat: { pattern: '0 * * * *' }, // every hour
        removeOnComplete: true,
        removeOnFail: 5,
      },
    );

    await this.feedQueue.add(
      CLEANUP_ORPHANED_POSTS_JOB,
      {},
      {
        repeat: { pattern: '0 3 * * *' }, // daily at 3 AM
        removeOnComplete: true,
        removeOnFail: 5,
      },
    );

    this.logger.log('Feed cleanup jobs scheduled');
  }
}
