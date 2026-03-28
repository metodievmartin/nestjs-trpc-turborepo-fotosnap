import { z } from 'zod';
import {
  cursorPaginationSchema,
  paginatedSchema,
} from '@repo/contracts/pagination';
/**
 * Instagram-style username rules:
 * - Lowercase letters, digits, underscores, periods
 * - 1–30 characters
 * - Cannot start or end with a period
 * - No consecutive special characters (.., __, ._, _.)
 */
export const USERNAME_REGEX =
  /^(?![.])(?!.*[._]{2})[a-z0-9._]{1,30}(?<![.])$/;

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(30, 'Username must be 30 characters or less')
  .regex(
    USERNAME_REGEX,
    'Username can only contain lowercase letters, numbers, underscores, and periods',
  );

export const userPreviewSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string().nullable(),
  isFollowing: z.boolean(),
});

export const userIdSchema = z.object({
  userId: z.string(),
});

export const usernameParamSchema = z.object({
  username: usernameSchema,
});

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  image: z.string().nullable(),
  followerCount: z.number(),
  followingCount: z.number(),
  postCount: z.number(),
  isFollowing: z.boolean(),
});

export const getFollowersSchema = userIdSchema.extend(
  cursorPaginationSchema.shape
);
export const getFollowingSchema = userIdSchema.extend(
  cursorPaginationSchema.shape
);
export const paginatedUserPreviewsSchema = paginatedSchema(userPreviewSchema);

export type UserPreview = z.infer<typeof userPreviewSchema>;
export type PaginatedUserPreviews = z.infer<typeof paginatedUserPreviewsSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UsernameParamInput = z.infer<typeof usernameParamSchema>;
export type GetFollowersInput = z.infer<typeof getFollowersSchema>;
export type GetFollowingInput = z.infer<typeof getFollowingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
