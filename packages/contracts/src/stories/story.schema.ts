import { z } from 'zod';

export const createStorySchema = z.object({
  image: z
    .string()
    .min(1, 'Image is required')
    .max(200, 'Max length is 200 chars'),
});

export const storySchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string(),
  }),
  image: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
});

export const storyGroupSchema = z.object({
  userId: z.string(),
  username: z.string(),
  avatar: z.string(),
  stories: z.array(storySchema),
});

export const nullableStoryGroupSchema = storyGroupSchema.nullable();

export const getUserStoriesSchema = z.object({
  userId: z.string().min(1),
});

export type Story = z.infer<typeof storySchema>;
export type StoryGroup = z.infer<typeof storyGroupSchema>;
export type NullableStoryGroup = z.infer<typeof nullableStoryGroupSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type GetUserStoriesInput = z.infer<typeof getUserStoriesSchema>;
