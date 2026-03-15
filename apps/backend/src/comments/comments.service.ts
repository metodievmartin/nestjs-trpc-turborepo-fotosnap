import { and, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CreateCommentInput, Comment } from '@repo/contracts/comments';

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

  async findByPostId(postId: number): Promise<Comment[]> {
    const comments = await this.database.query.comment.findMany({
      where: eq(comment.postId, postId),
      with: {
        user: true,
      },
    });

    return comments.map((currentComment) => ({
      id: currentComment.id,
      userId: currentComment.userId,
      text: currentComment.text,
      user: {
        id: currentComment.user.id,
        username: currentComment.user.name,
        avatar: currentComment.user.image || '',
      },
      createdAt: currentComment.createdAt.toISOString(),
    }));
  }

  async delete(commentId: number, userId: string) {
    await this.database
      .delete(comment)
      .where(and(eq(comment.id, commentId), eq(comment.userId, userId)));
  }
}
