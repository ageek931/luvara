import { z } from "zod";

export const extendMatchSchema = z.object({
  hours: z.number().int().min(1).max(72).default(24),
});

export const unmatchSchema = z.object({
  reason: z.string().max(200).optional(),
});

export const matchQuerySchema = z.object({
  status: z.enum(["active", "expired", "unmatched", "archived"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
