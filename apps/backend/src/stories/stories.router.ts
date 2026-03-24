import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';

import {
  nullableStoryGroupSchema,
  paginatedStoryGroupsSchema,
  getFeedStoriesSchema,
  storySchema,
  createStorySchema,
  getUserStoriesSchema,
  type CreateStoryInput,
  type GetUserStoriesInput,
  type GetFeedStoriesInput,
} from '@repo/contracts/stories';

import { StoriesService } from './stories.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import type { TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'stories' })
@UseMiddlewares(AuthTrpcMiddleware)
export class StoriesRouter {
  constructor(private readonly storiesService: StoriesService) {}

  @Query({ output: nullableStoryGroupSchema })
  async getOwnStories(@Ctx() context: TrpcSessionContext) {
    return this.storiesService.getUserStories(context.user.id);
  }

  @Query({
    input: getUserStoriesSchema,
    output: nullableStoryGroupSchema,
  })
  async getUserStories(
    @Input() input: GetUserStoriesInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.storiesService.getUserStories(input.userId);
  }

  @Query({
    input: getFeedStoriesSchema,
    output: paginatedStoryGroupsSchema,
  })
  async getFeedStories(
    @Ctx() context: TrpcSessionContext,
    @Input() input: GetFeedStoriesInput,
  ) {
    return this.storiesService.getFeedStories(
      context.user.id,
      input.cursor,
      input.limit,
    );
  }

  @Mutation({ input: createStorySchema, output: storySchema })
  async create(
    @Input() createStoryInput: CreateStoryInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.storiesService.create(createStoryInput, context.user.id);
  }
}
