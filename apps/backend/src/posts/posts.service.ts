import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreatePostInput, PaginatedPosts, Post } from '@repo/contracts/posts';
import { and, desc, eq, InferSelectModel, lt, or, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { like, post } from './schemas/schema';
import { comment } from '../comments/schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { user } from '../auth/schema';

type PostWithRelations = InferSelectModel<typeof post> & {
  user: InferSelectModel<typeof user>;
  likes: InferSelectModel<typeof like>[];
  comments: InferSelectModel<typeof comment>[];
};

@Injectable()
export class PostsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(
    userId: string,
    postUserId?: string,
    cursor?: string | null,
    limit = 10,
  ): Promise<PaginatedPosts> {
    const conditions: SQL[] = [];
    if (postUserId) conditions.push(eq(post.userId, postUserId));

    // Compound cursor: "createdAt|id" — orders by creation time with id as tiebreaker
    if (cursor) {
      const parts = cursor.split('|');
      if (parts.length !== 2) {
        throw new BadRequestException('Invalid cursor format');
      }
      const [createdAtStr, idStr] = parts;
      const createdAt = new Date(createdAtStr);
      const id = Number(idStr);
      if (isNaN(createdAt.getTime()) || isNaN(id)) {
        throw new BadRequestException('Invalid cursor format');
      }
      // Seek past the cursor: rows older than createdAt, OR same createdAt but smaller id
      const cursorCond = or(
        lt(post.createdAt, createdAt),
        and(eq(post.createdAt, createdAt), lt(post.id, id)),
      );
      if (cursorCond) conditions.push(cursorCond);
    }

    const posts = await this.database.query.post.findMany({
      with: {
        user: true,
        likes: true,
        comments: true,
      },
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(post.createdAt), desc(post.id)],
      limit: limit + 1, // fetch one extra to detect if there's a next page
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;

    return {
      items: items.map((savedPost) => this.mapToPost(savedPost, userId)),
      nextCursor: hasMore
        ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`
        : null,
      hasMore,
    };
  }

  async findById(postId: number, userId: string): Promise<Post | null> {
    const savedPost = await this.database.query.post.findFirst({
      with: {
        user: true,
        likes: true,
        comments: true,
      },
      where: eq(post.id, postId),
    });

    if (!savedPost) return null;

    return this.mapToPost(savedPost, userId);
  }

  private mapToPost(savedPost: PostWithRelations, userId: string): Post {
    return {
      id: savedPost.id,
      user: {
        id: savedPost.user.id,
        username: savedPost.user.name,
        avatar: savedPost.user.image || '',
      },
      image: savedPost.image,
      caption: savedPost.caption,
      likes: savedPost.likes.length,
      comments: savedPost.comments.length,
      timestamp: savedPost.createdAt.toISOString(),
      isLiked: savedPost.likes.some((like) => like.userId === userId),
    };
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
