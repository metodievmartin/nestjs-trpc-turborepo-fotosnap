import { and, asc, eq, gt } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  CreateCommentInput,
  Comment,
  PaginatedComments,
} from '@repo/contracts/comments';

import { comment } from './schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async create({ text, postId }: CreateCommentInput, userId: string) {
    const [created] = await this.database
      .insert(comment)
      .values({
        userId,
        text,
        postId,
        createdAt: new Date(),
      })
      .returning({ id: comment.id });

    return { id: created.id };
  }

  async findByPostId(
    postId: number,
    cursor?: string | null,
    limit = 20,
  ): Promise<PaginatedComments> {
    const conditions = [eq(comment.postId, postId)];
    if (cursor) conditions.push(gt(comment.id, Number(cursor)));

    const comments = await this.database.query.comment.findMany({
      where: and(...conditions),
      orderBy: [asc(comment.id)],
      limit: limit + 1,
      with: {
        user: true,
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;

    return {
      items: items.map((currentComment) => ({
        id: currentComment.id,
        userId: currentComment.userId,
        text: currentComment.text,
        user: {
          id: currentComment.user.id,
          username: currentComment.user.username,
          avatar: currentComment.user.image || '',
        },
        createdAt: currentComment.createdAt.toISOString(),
      })),
      nextCursor: hasMore ? String(items[items.length - 1].id) : null,
      hasMore,
    };
  }

  async delete(commentId: number, userId: string) {
    await this.database
      .delete(comment)
      .where(and(eq(comment.id, commentId), eq(comment.userId, userId)));
  }
}
