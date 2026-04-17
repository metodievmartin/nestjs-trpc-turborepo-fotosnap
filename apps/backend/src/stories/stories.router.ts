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
  storySchema,
  createStorySchema,
  getUserStoriesSchema,
  type CreateStoryInput,
  type GetUserStoriesInput,
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

  @Mutation({ input: createStorySchema, output: storySchema })
  async create(
    @Input() createStoryInput: CreateStoryInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.storiesService.create(createStoryInput, context.user.id);
  }
}
