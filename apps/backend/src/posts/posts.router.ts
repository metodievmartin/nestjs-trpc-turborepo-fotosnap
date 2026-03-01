import { z } from 'zod';
import {
  Router,
  Mutation,
  Input,
  Query,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc';
import {
  postSchema,
  likePostSchema,
  createPostSchema,
  type LikePostInput,
  type CreatePostInput,
} from '@repo/contracts/posts';

import { PostsService } from './posts.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import type { TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'posts' })
@UseMiddlewares(AuthTrpcMiddleware)
export class PostsRouter {
  constructor(private postsService: PostsService) {}

  @Query({ output: z.array(postSchema) })
  async findAll(@Ctx() context: TrpcSessionContext) {
    return this.postsService.findAll(context.user.id);
  }

  @Mutation({ input: createPostSchema })
  async create(
    @Input() createPostInput: CreatePostInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.postsService.create(createPostInput, context.user.id);
  }

  @Mutation({ input: likePostSchema })
  async likePost(
    @Input() likePostInput: LikePostInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.postsService.likePost(likePostInput.postId, context.user.id);
  }
}
