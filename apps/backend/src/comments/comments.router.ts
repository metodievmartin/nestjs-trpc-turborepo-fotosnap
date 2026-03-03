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
  commentSchema,
  getCommentsSchema,
  createCommentSchema,
  deleteCommentSchema,
  type GetCommentsInput,
  type CreateCommentInput,
  type DeleteCommentInput,
} from '@repo/contracts/comments';
import { CommentsService } from './comments.service';
import { AuthTrpcMiddleware } from '../auth/auth-trpc.middleware';
import { type TrpcSessionContext } from '../app-context.interface';

@Router({ alias: 'comments' })
@UseMiddlewares(AuthTrpcMiddleware)
export class CommentsRouter {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation({
    input: createCommentSchema,
    output: z.object({ id: z.number() }),
  })
  async create(
    @Input() createCommentInput: CreateCommentInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.commentsService.create(createCommentInput, context.user.id);
  }

  @Query({ input: getCommentsSchema, output: z.array(commentSchema) })
  async findByPostId(@Input() getCommentsInput: GetCommentsInput) {
    return this.commentsService.findByPostId(getCommentsInput.postId);
  }

  @Mutation({ input: deleteCommentSchema })
  async delete(
    @Input() deleteCommentInput: DeleteCommentInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.commentsService.delete(
      deleteCommentInput.commentId,
      context.user.id,
    );
  }
}
