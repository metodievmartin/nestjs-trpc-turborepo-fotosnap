import { z } from 'zod';
import {
  numericCursorPaginationSchema,
  paginatedSchema,
} from '@repo/contracts/pagination';

export const createCommentSchema = z.object({
  postId: z.number(),
  text: z.string().min(1, 'Comment cannot be empty').max(1100),
});

export const deleteCommentSchema = z.object({
  commentId: z.number(),
});

export const getCommentsSchema = z
  .object({
    postId: z.number(),
  })
  .extend(numericCursorPaginationSchema.shape);

export const commentSchema = z.object({
  id: z.number(),
  userId: z.string(),
  text: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string(),
  }),
  createdAt: z.string(),
});

export const paginatedCommentsSchema = paginatedSchema(commentSchema);

export type Comment = z.infer<typeof commentSchema>;
export type PaginatedComments = z.infer<typeof paginatedCommentsSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
