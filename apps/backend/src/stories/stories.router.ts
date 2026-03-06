import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { z } from 'zod';

import {
  storyGroupSchema,
  storySchema,
  createStorySchema,
  type CreateStoryInput,
} from '@repo/contracts/stories';

import { StoriesService } from './stories.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import type { TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'stories' })
@UseMiddlewares(AuthTrpcMiddleware)
export class StoriesRouter {
  constructor(private readonly storiesService: StoriesService) {}

  @Query({ output: z.array(storyGroupSchema) })
  async getStories(@Ctx() context: TrpcSessionContext) {
    return this.storiesService.getStories(context.user.id);
  }

  @Mutation({ input: createStorySchema, output: storySchema })
  async create(
    @Input() createStoryInput: CreateStoryInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.storiesService.create(createStoryInput, context.user.id);
  }
}
