import { z } from "zod";

export const swipeSchema = z.object({
  swipedId: z.string().uuid(),
  direction: z.enum(["like", "pass", "superlike"]),
  context: z.string().optional(),
});

export const promptCommentSchema = z.object({
  comment: z.string().min(1).max(500),
});

export const compatibilityQuerySchema = z.object({
  targetUserId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const deckQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});
