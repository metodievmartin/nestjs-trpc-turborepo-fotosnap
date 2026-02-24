import { z } from 'zod';
import { Router, Mutation, Input, Query } from 'nestjs-trpc';
import {
  createPostSchema,
  postSchema,
  type CreatePostInput,
} from '@repo/contracts/posts';

import { PostsService } from './posts.service';

@Router({ alias: 'posts' })
export class PostsRouter {
  constructor(private postsService: PostsService) {}

  @Query({ output: z.array(postSchema) })
  async findAll() {
    return this.postsService.findAll();
  }

  @Mutation({ input: createPostSchema, output: postSchema })
  async create(@Input() createPostInput: CreatePostInput) {
    return this.postsService.create(
      createPostInput,
      'FgOSjJSjigClCLGQ0GdXYRx4JICbM9zI',
    );
  }
}
