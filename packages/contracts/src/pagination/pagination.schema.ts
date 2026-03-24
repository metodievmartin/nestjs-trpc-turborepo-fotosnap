import { z } from 'zod';

// Opaque string cursor — used by endpoints with compound cursors (e.g. "createdAt|id").
// No format validation here; the service layer parses and validates.
export const cursorPaginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Stricter variant for endpoints whose cursor is a single numeric ID (e.g. comments, stories).
// Rejects non-digit cursors at the tRPC input validation layer before hitting the service.
export const numericCursorPaginationSchema = z.object({
  cursor: z
    .string()
    .regex(/^\d+$/, 'Invalid cursor')
    .nullish(),
  limit: z.number().int().min(1).max(100).optional(),
});

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
