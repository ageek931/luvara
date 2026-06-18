import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  updateProfileSchema,
  addPromptSchema,
  updatePromptSchema,
  updatePreferencesSchema,
  uploadVoiceSchema,
  searchProfilesSchema,
} from "../schemas/profile.schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";

const router = Router();

function calculateCompleteness(profile: {
  displayName: string;
  birthday: unknown;
  gender: unknown;
  orientation: unknown;
  bio: unknown;
  intent: unknown;
  valuesTags: string[];
  interests: string[];
  height: unknown;
  education: unknown;
  occupation: unknown;
  locationLat: unknown;
  locationLng: unknown;
  locationCity: unknown;
  locationCountry: unknown;
}): number {
  const fields = [
    profile.displayName && profile.displayName.length > 0,
    !!profile.birthday,
    !!profile.gender,
    !!profile.orientation,
    !!profile.bio && profile.bio.length >= 20,
    !!profile.intent,
    profile.valuesTags.length > 0,
    profile.interests.length > 0,
    !!profile.height,
    !!profile.education,
    !!profile.occupation,
    !!profile.locationLat && !!profile.locationLng,
    !!profile.locationCity,
    !!profile.locationCountry,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

router.get("/search", authenticate, validate(searchProfilesSchema, "query"), async (req, res, next) => {
  try {
    const { city, intent, gender, ageMin, ageMax, minCompleteness, page, limit } = req.query as z.infer<typeof searchProfilesSchema>;

    const where: Record<string, unknown> = {};
    if (city) where.locationCity = { contains: city, mode: "insensitive" };
    if (intent) where.intent = intent;
    if (gender) where.gender = gender;

    const profiles = await prisma.profile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        photos: { where: { isPrimary: true }, take: 1 },
      },
    });

    const total = await prisma.profile.count({ where });

    const filtered = minCompleteness
      ? profiles.filter((p) => calculateCompleteness(p) >= minCompleteness)
      : profiles;

    res.json({
      success: true,
      data: {
        profiles: filtered,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.params.userId },
      include: {
        photos: { where: { moderationStatus: "approved" }, orderBy: { order: "asc" } },
        prompts: { orderBy: { order: "asc" } },
      },
    });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

router.put("/me", authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const data = req.body;

    if (data.birthday) {
      data.birthday = new Date(data.birthday);
    }

    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (!existing) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");

      data.userId = userId;
      data.displayName = data.displayName ?? user.displayName;
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.displayName ?? "User",
        birthday: data.birthday,
        gender: data.gender,
        orientation: data.orientation,
        bio: data.bio,
        intent: data.intent,
        valuesTags: data.valuesTags ?? [],
        interests: data.interests ?? [],
        height: data.height,
        education: data.education,
        occupation: data.occupation,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        locationCity: data.locationCity,
        locationCountry: data.locationCountry,
      },
      update: data,
    });

    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

router.post("/me/photos", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const photoCount = await prisma.photo.count({ where: { userId } });
    if (photoCount >= 9) {
      res.status(400).json({ success: false, error: "Maximum 9 photos allowed" });
      return;
    }

    const { url, thumbnailUrl, order, isPrimary } = req.body;

    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const photo = await prisma.photo.create({
      data: {
        userId,
        url: url ?? "https://luvara-storage.s3.amazonaws.com/placeholder.png",
        thumbnailUrl: thumbnailUrl ?? "https://luvara-storage.s3.amazonaws.com/placeholder-thumb.png",
        order: order ?? photoCount,
        isPrimary: isPrimary ?? photoCount === 0,
      },
    });

    res.status(201).json({ success: true, data: { photo } });
  } catch (error) {
    next(error);
  }
});

router.get("/me/photos", authenticate, async (req, res, next) => {
  try {
    const photos = await prisma.photo.findMany({
      where: { userId: req.user!.userId },
      orderBy: { order: "asc" },
    });

    res.json({ success: true, data: { photos } });
  } catch (error) {
    next(error);
  }
});

router.put("/me/photos/:id/reorder", authenticate, async (req, res, next) => {
  try {
    const photoId = req.params.id;
    const { newOrder } = req.body;

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId: req.user!.userId },
    });
    if (!photo) throw new NotFoundError("Photo not found");

    const updated = await prisma.photo.update({
      where: { id: photoId },
      data: { order: newOrder },
    });

    res.json({ success: true, data: { photo: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete("/me/photos/:id", authenticate, async (req, res, next) => {
  try {
    const photoId = req.params.id;

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId: req.user!.userId },
    });
    if (!photo) throw new NotFoundError("Photo not found");

    await prisma.photo.delete({ where: { id: photoId } });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

router.post("/me/prompts", authenticate, validate(addPromptSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { promptText, responseText, category, order } = req.body;

    const promptCount = await prisma.prompt.count({ where: { userId } });
    if (promptCount >= 5) {
      res.status(400).json({ success: false, error: "Maximum 5 prompts allowed" });
      return;
    }

    const prompt = await prisma.prompt.create({
      data: {
        userId,
        promptText,
        responseText,
        category,
        order: order ?? promptCount,
      },
    });

    res.status(201).json({ success: true, data: { prompt } });
  } catch (error) {
    next(error);
  }
});

router.put("/me/prompts/:id", authenticate, validate(updatePromptSchema), async (req, res, next) => {
  try {
    const promptId = req.params.id;

    const prompt = await prisma.prompt.findFirst({
      where: { id: promptId, userId: req.user!.userId },
    });
    if (!prompt) throw new NotFoundError("Prompt not found");

    const updated = await prisma.prompt.update({
      where: { id: promptId },
      data: req.body,
    });

    res.json({ success: true, data: { prompt: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete("/me/prompts/:id", authenticate, async (req, res, next) => {
  try {
    const promptId = req.params.id;

    const prompt = await prisma.prompt.findFirst({
      where: { id: promptId, userId: req.user!.userId },
    });
    if (!prompt) throw new NotFoundError("Prompt not found");

    await prisma.prompt.delete({ where: { id: promptId } });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

router.put("/me/preferences", authenticate, validate(updatePreferencesSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...req.body },
      update: req.body,
    });

    res.json({ success: true, data: { preferences } });
  } catch (error) {
    next(error);
  }
});

router.get("/me/preferences", authenticate, async (req, res, next) => {
  try {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: req.user!.userId },
    });

    res.json({ success: true, data: { preferences: preferences ?? {} } });
  } catch (error) {
    next(error);
  }
});

router.post("/me/voice", authenticate, validate(uploadVoiceSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { url, durationSecs } = req.body;

    await prisma.voiceIntro.deleteMany({ where: { userId } });

    const voice = await prisma.voiceIntro.create({
      data: { userId, url, durationSecs },
    });

    res.status(201).json({ success: true, data: { voiceIntro: voice } });
  } catch (error) {
    next(error);
  }
});

router.post("/me/video", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    res.status(201).json({
      success: true,
      data: {
        videoIntro: {
          id: "placeholder",
          userId,
          url: "https://luvara-storage.s3.amazonaws.com/video-placeholder.mp4",
          durationSecs: null,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me/completeness", authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      res.json({ success: true, data: { completeness: 0, missingFields: Object.keys(updateProfileSchema.shape) } });
      return;
    }

    const score = calculateCompleteness(profile);

    const missingFields: string[] = [];
    if (!profile.birthday) missingFields.push("birthday");
    if (!profile.gender) missingFields.push("gender");
    if (!profile.bio || profile.bio.length < 20) missingFields.push("bio");
    if (!profile.intent) missingFields.push("intent");
    if (profile.valuesTags.length === 0) missingFields.push("valuesTags");
    if (profile.interests.length === 0) missingFields.push("interests");

    res.json({ success: true, data: { completeness: score, missingFields } });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    res.json({
      success: true,
      data: {
        message: "Photo verification request submitted",
        status: "pending",
        estimatedReviewTime: "24-48 hours",
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
