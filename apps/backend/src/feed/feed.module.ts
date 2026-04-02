import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { FEED_QUEUE } from './feed.constants';
import { FeedService } from './feed.service';
import { FeedRouter } from './feed.router';
import { FeedPublisher } from './feed.publisher';
import { FeedProcessor } from './feed.processor';
import { FeedCleanupService } from './feed-cleanup.service';
import { PostFeedBuilder } from './builders/post-feed-builder';
import { StoryFeedBuilder } from './builders/story-feed-builder';
import { ChronologicalRanking } from './ranking/chronological.ranking';
import { RANKING_STRATEGY } from './ranking/ranking-strategy.interface';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, BullModule.registerQueue({ name: FEED_QUEUE })],
  providers: [
    FeedService,
    FeedRouter,
    FeedPublisher,
    FeedProcessor,
    FeedCleanupService,
    PostFeedBuilder,
    StoryFeedBuilder,
    {
      provide: RANKING_STRATEGY,
      useClass: ChronologicalRanking,
    },
  ],
})
export class FeedModule {}
