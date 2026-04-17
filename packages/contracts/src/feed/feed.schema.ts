import { z } from 'zod';
import {
  cursorPaginationSchema,
  numericCursorPaginationSchema,
} from '@repo/contracts/pagination';
import { paginatedPostsSchema } from '@repo/contracts/posts';
import { paginatedStoryGroupsSchema } from '@repo/contracts/stories';

export const getPostFeedSchema = cursorPaginationSchema;
export const getStoryFeedSchema = numericCursorPaginationSchema;

export const postFeedResponseSchema = paginatedPostsSchema;
export const storyFeedResponseSchema = paginatedStoryGroupsSchema;

export type GetPostFeedInput = z.infer<typeof getPostFeedSchema>;
export type GetStoryFeedInput = z.infer<typeof getStoryFeedSchema>;
