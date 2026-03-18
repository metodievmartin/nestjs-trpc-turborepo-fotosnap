import { z } from 'zod';

export const userPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  isFollowing: z.boolean(),
});

export const userIdSchema = z.object({
  userId: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  image: z.string().nullable(),
  followerCount: z.number(),
  followingCount: z.number(),
  postCount: z.number(),
  isFollowing: z.boolean(),
});

export type UserPreview = z.infer<typeof userPreviewSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
