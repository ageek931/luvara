import { z } from "zod";

export const addXpSchema = z.object({
  amount: z.number().int().min(1).max(10000),
  source: z.string().min(1).max(100),
});

export const spendCoinsSchema = z.object({
  amount: z.number().int().min(1),
  source: z.string().min(1).max(100),
});
