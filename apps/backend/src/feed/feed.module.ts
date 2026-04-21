import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsOptions } from 'bullmq';

import {
  FEED_FANOUT_QUEUE,
  FEED_BACKFILL_QUEUE,
  FEED_CLEANUP_QUEUE,
} from './feed.constants';
import { FeedService } from './feed.service';
import { FeedRouter } from './feed.router';
import { FeedPublisher } from './feed.publisher';
import { FeedCleanupService } from './feed-cleanup.service';
import { PostFeedBuilder } from './builders/post-feed-builder';
import { StoryFeedBuilder } from './builders/story-feed-builder';
import { ChronologicalRanking } from './ranking/chronological.ranking';
import { RANKING_STRATEGY } from './ranking/ranking-strategy.interface';
import { DatabaseModule } from '../database/database.module';
import { getEnabledWorkerRoles } from './worker-roles';
import { FeedFanoutProcessor } from './workers/fanout.processor';
import { FeedBackfillProcessor } from './workers/backfill.processor';
import { FeedCleanupProcessor } from './workers/cleanup.processor';

// Event-driven lanes: retry transient failures with exponential backoff.
const EVENT_DRIVEN_DEFAULTS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 86400 },
};

// Cleanup: cron re-fires, so retries would double-run DELETEs for no gain.
const CLEANUP_DEFAULTS: JobsOptions = {
  attempts: 1,
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 86400 },
};

@Module({})
export class FeedModule {
  static forRoot(): DynamicModule {
    const enabledRoles = getEnabledWorkerRoles();

    // Producers and HTTP-serving providers run in every process that loads
    // FeedModule — including API-only processes with WORKER_ROLES=none.
    const baseProviders: Provider[] = [
      FeedService,
      FeedRouter,
      FeedPublisher,
      FeedCleanupService,
      PostFeedBuilder,
      StoryFeedBuilder,
      {
        provide: RANKING_STRATEGY,
        useClass: ChronologicalRanking,
      },
    ];

    const workerProviders: Provider[] = [];
    if (enabledRoles.has('fanout')) workerProviders.push(FeedFanoutProcessor);
    if (enabledRoles.has('backfill'))
      workerProviders.push(FeedBackfillProcessor);
    if (enabledRoles.has('cleanup')) workerProviders.push(FeedCleanupProcessor);

    return {
      module: FeedModule,
      imports: [
        DatabaseModule,
        // Queues are registered unconditionally — producers (FeedPublisher,
        // FeedCleanupService) need to inject them even in API-only processes.
        BullModule.registerQueue(
          { name: FEED_FANOUT_QUEUE, defaultJobOptions: EVENT_DRIVEN_DEFAULTS },
          {
            name: FEED_BACKFILL_QUEUE,
            defaultJobOptions: EVENT_DRIVEN_DEFAULTS,
          },
          { name: FEED_CLEANUP_QUEUE, defaultJobOptions: CLEANUP_DEFAULTS },
        ),
      ],
      providers: [...baseProviders, ...workerProviders],
    };
  }
}
