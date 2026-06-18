import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
  gender: z.string().max(50).optional().nullable(),
  orientation: z.string().max(50).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  intent: z.string().max(50).optional().nullable(),
  valuesTags: z.array(z.string().max(50)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  height: z.number().int().min(100).max(250).optional().nullable(),
  education: z.string().max(200).optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  locationCity: z.string().max(100).optional().nullable(),
  locationCountry: z.string().max(100).optional().nullable(),
});

export const addPhotoSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export const reorderPhotosSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
});

export const addPromptSchema = z.object({
  promptText: z.string().min(1).max(300),
  responseText: z.string().min(1).max(1000),
  category: z.string().min(1).max(50),
  order: z.number().int().min(0).optional(),
});

export const updatePromptSchema = z.object({
  promptText: z.string().min(1).max(300).optional(),
  responseText: z.string().min(1).max(1000).optional(),
  category: z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
});

export const updatePreferencesSchema = z.object({
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  distanceMax: z.number().int().min(1).max(500).optional(),
  genderPreference: z.array(z.string().max(50)).optional(),
  intentPreference: z.array(z.string().max(50)).optional(),
  dealbreakers: z.record(z.boolean()).optional(),
  verifiedOnly: z.boolean().optional(),
});

export const uploadVoiceSchema = z.object({
  url: z.string().url(),
  durationSecs: z.number().positive().optional(),
});

export const searchProfilesSchema = z.object({
  city: z.string().optional(),
  intent: z.string().optional(),
  gender: z.string().optional(),
  ageMin: z.coerce.number().int().min(18).optional(),
  ageMax: z.coerce.number().int().max(99).optional(),
  minCompleteness: z.coerce.number().int().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
