import { Inject, Injectable } from '@nestjs/common';
import { CreatePostInput, Post } from '@repo/contracts/posts';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { like, post } from './schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { UsersService } from '../auth/users/users.service';
import { and, desc, eq } from 'drizzle-orm';
import { user } from '../auth/schema';

@Injectable()
export class PostsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: string): Promise<Post[]> {
    const posts = await this.database.query.post.findMany({
      with: {
        user: true,
        likes: true,
        comments: true,
      },
      orderBy: [desc(post.createdAt)],
    });

    return posts.map((savedPost) => ({
      id: savedPost.id,
      user: {
        username: savedPost.user.name,
        avatar: savedPost.user.image || '',
      },
      image: savedPost.image,
      caption: savedPost.caption,
      likes: savedPost.likes.length,
      comments: savedPost.comments.length,
      timestamp: savedPost.createdAt.toISOString(),
      isLiked: savedPost.likes.some((like) => like.userId === userId),
    }));
  }

  async create(createPostInput: CreatePostInput, userId: string) {
    await this.database
      .insert(post)
      .values({
        userId,
        caption: createPostInput.caption,
        image: createPostInput.image,
        createdAt: new Date(),
      })
      .returning();
  }

  async likePost(postId: number, userId: string) {
    const existingLike = await this.database.query.like.findFirst({
      where: and(eq(like.postId, postId), eq(like.userId, userId)),
    });

    if (existingLike) {
      await this.database.delete(like).where(eq(like.id, existingLike.id));
    } else {
      await this.database.insert(like).values({
        postId,
        userId,
      });
    }
  }
}
