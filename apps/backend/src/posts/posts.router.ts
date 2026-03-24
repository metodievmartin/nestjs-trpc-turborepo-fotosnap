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
  paginatedPostsSchema,
  likePostSchema,
  createPostSchema,
  findAllPostsSchema,
  findByIdPostSchema,
  type LikePostInput,
  type CreatePostInput,
  type FindAllPostsInput,
  type FindByIdPostInput,
} from '@repo/contracts/posts';

import { PostsService } from './posts.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import type { TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'posts' })
@UseMiddlewares(AuthTrpcMiddleware)
export class PostsRouter {
  constructor(private postsService: PostsService) {}

  @Query({ output: paginatedPostsSchema, input: findAllPostsSchema })
  async findAll(
    @Ctx() context: TrpcSessionContext,
    @Input() findAllPostsInput: FindAllPostsInput,
  ) {
    return this.postsService.findAll(
      context.user.id,
      findAllPostsInput.userId,
      findAllPostsInput.cursor,
      findAllPostsInput.limit,
    );
  }

  @Query({ output: postSchema.nullable(), input: findByIdPostSchema })
  async findById(
    @Ctx() context: TrpcSessionContext,
    @Input() input: FindByIdPostInput,
  ) {
    return this.postsService.findById(input.postId, context.user.id);
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
