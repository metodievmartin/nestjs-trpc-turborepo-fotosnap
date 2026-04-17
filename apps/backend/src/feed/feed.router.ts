import { Ctx, Input, Query, Router, UseMiddlewares } from 'nestjs-trpc';

import {
  getPostFeedSchema,
  getStoryFeedSchema,
  postFeedResponseSchema,
  storyFeedResponseSchema,
  type GetPostFeedInput,
  type GetStoryFeedInput,
} from '@repo/contracts/feed';

import { FeedService } from './feed.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import type { TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'feed' })
@UseMiddlewares(AuthTrpcMiddleware)
export class FeedRouter {
  constructor(private readonly feedService: FeedService) {}

  @Query({ input: getPostFeedSchema, output: postFeedResponseSchema })
  async getPostFeed(
    @Ctx() context: TrpcSessionContext,
    @Input() input: GetPostFeedInput,
  ) {
    return this.feedService.getPostFeed(
      context.user.id,
      input.cursor,
      input.limit,
    );
  }

  @Query({ input: getStoryFeedSchema, output: storyFeedResponseSchema })
  async getStoryFeed(
    @Ctx() context: TrpcSessionContext,
    @Input() input: GetStoryFeedInput,
  ) {
    return this.feedService.getStoryFeed(
      context.user.id,
      input.cursor,
      input.limit,
    );
  }
}
