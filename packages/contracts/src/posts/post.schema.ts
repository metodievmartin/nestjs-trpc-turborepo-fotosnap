import { z } from 'zod';
import {
  cursorPaginationSchema,
  paginatedSchema,
} from '@repo/contracts/pagination';

export const findAllPostsSchema = z
  .object({
    userId: z.string().optional(),
  })
  .extend(cursorPaginationSchema.shape);

export const createPostSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  caption: z.string().min(1, 'Caption is required'),
});

export const postSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string(),
  }),
  image: z.string(),
  caption: z.string(),
  likes: z.number(),
  comments: z.number(),
  timestamp: z.string(),
  isLiked: z.boolean().optional(),
});

export const findByIdPostSchema = z.object({
  postId: z.number(),
});

export const likePostSchema = z.object({
  postId: z.number(),
});

export const paginatedPostsSchema = paginatedSchema(postSchema);

export type Post = z.infer<typeof postSchema>;
export type PaginatedPosts = z.infer<typeof paginatedPostsSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type LikePostInput = z.infer<typeof likePostSchema>;
export type FindByIdPostInput = z.infer<typeof findByIdPostSchema>;
export type FindAllPostsInput = z.infer<typeof findAllPostsSchema>;
