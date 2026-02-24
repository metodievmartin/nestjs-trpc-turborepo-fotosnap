import { Inject, Injectable } from '@nestjs/common';
import { CreatePostInput, Post } from '@repo/contracts/posts';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { post } from './schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { UsersService } from '../auth/users/users.service';
import { desc } from 'drizzle-orm';

@Injectable()
export class PostsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Post[]> {
    const posts = await this.database.query.post.findMany({
      with: {
        user: true,
      },
      orderBy: [desc(post.createdAt)],
    });

    return posts.map((savedPost) => ({
      id: savedPost.id,
      user: {
        username: savedPost.user.name,
        avatar: '',
      },
      image: savedPost.image,
      caption: savedPost.caption,
      likes: savedPost.likes,
      comments: 0,
      timestamp: savedPost.createdAt.toISOString(),
    }));
  }

  async create(createPostInput: CreatePostInput, userId: string) {
    const [newPost] = await this.database
      .insert(post)
      .values({
        userId,
        caption: createPostInput.caption,
        image: '',
        likes: 0,
        createdAt: new Date(),
      })
      .returning();

    return this.formatPostResponse(newPost, userId);
  }

  private async formatPostResponse(
    savedPost: typeof post.$inferSelect,
    userId: string,
  ): Promise<Post> {
    const userInfo = await this.usersService.findById(userId);

    return {
      id: savedPost.id,
      user: {
        username: userInfo.name,
        avatar: '',
      },
      image: savedPost.image,
      caption: savedPost.caption,
      likes: savedPost.likes,
      comments: 0,
      timestamp: savedPost.createdAt.toISOString(),
    };
  }
}
