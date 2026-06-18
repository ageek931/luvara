import { z } from "zod";

export const createCheckoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const createSubscriptionSchema = z.object({
  planTier: z.enum(["premium", "elite"]),
  billingPeriod: z.enum(["monthly", "annual"]),
});

export const updateSubscriptionSchema = z.object({
  planTier: z.enum(["premium", "elite"]),
  billingPeriod: z.enum(["monthly", "annual"]),
});
