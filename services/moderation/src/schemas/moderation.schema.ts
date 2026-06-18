import { z } from "zod";

export const createReportSchema = z.object({
  reportedId: z.string().uuid(),
  category: z.enum(["fake_profile", "harassment", "explicit_content", "underage", "spam", "safety_concern", "other"]),
  description: z.string().max(2000).optional(),
});

export const resolveReportSchema = z.object({
  action: z.enum(["dismiss", "warn", "restrict", "suspend", "ban"]),
  moderatorNote: z.string().max(2000).optional(),
  durationDays: z.number().int().positive().optional(),
});
