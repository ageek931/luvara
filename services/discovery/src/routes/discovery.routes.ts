import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { swipeSchema, promptCommentSchema, deckQuerySchema } from "../schemas/discovery.schema";
import { NotFoundError } from "../utils/errors";

const router = Router();

function calculateAge(birthday: Date | null): number | null {
  if (!birthday) return null;
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

function calculateDistance(
  lat1: number | null,
  lng1: number | null,
  lat2: number | null,
  lng2: number | null
): number | null {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface ScoredProfile {
  profile: Record<string, unknown>;
  score: number;
  compatibility: {
    intentMatch: number;
    distanceFit: number;
    ageFit: number;
    completeness: number;
  };
}

function scoreProfile(
  profile: {
    intent: string | null;
    locationLat: number | null;
    locationLng: number | null;
    birthday: Date | null;
    displayName: string;
    valuesTags: string[];
    interests: string[];
    bio: string | null;
    gender: string | null;
    orientation: string | null;
    height: number | null;
    education: string | null;
    occupation: string | null;
    locationCity: string | null;
    locationCountry: string | null;
  },
  userProfile: {
    intent: string | null;
    locationLat: number | null;
    locationLng: number | null;
    birthday: Date | null;
    valuesTags: string[];
  },
  preferences: {
    ageMin: number;
    ageMax: number;
    distanceMax: number;
    intentPreference: string[];
    genderPreference: string[];
  }
): ScoredProfile {
  const intentMatch = userProfile.intent && userProfile.intent === profile.intent ? 1 : 0;

  const distance = calculateDistance(userProfile.locationLat, userProfile.locationLng, profile.locationLat, profile.locationLng);
  const distanceFit = distance != null && preferences.distanceMax > 0
    ? Math.max(0, 1 - distance / preferences.distanceMax)
    : 0.5;

  const profileAge = calculateAge(profile.birthday);
  const userAge = calculateAge(userProfile.birthday);
  let ageFit = 0.5;
  if (profileAge != null && userAge != null) {
    const ageDiff = Math.abs(profileAge - userAge);
    ageFit = Math.max(0, 1 - ageDiff / 20);
  }

  const completenessFields = [
    profile.displayName.length > 0,
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
  const completeness = completenessFields.filter(Boolean).length / completenessFields.length;

  const score = intentMatch * 0.4 + distanceFit * 0.3 + ageFit * 0.2 + completeness * 0.1;

  return {
    profile: profile as unknown as Record<string, unknown>,
    score: Math.round(score * 100) / 100,
    compatibility: {
      intentMatch: Math.round(intentMatch * 100) / 100,
      distanceFit: Math.round(distanceFit * 100) / 100,
      ageFit: Math.round(ageFit * 100) / 100,
      completeness: Math.round(completeness * 100) / 100,
    },
  };
}

router.get("/deck", authenticate, validate(deckQuerySchema, "query"), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { limit } = req.query as z.infer<typeof deckQuerySchema>;

    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!userProfile) {
      res.status(400).json({ success: false, error: "Complete your profile first" });
      return;
    }

    const preferences = await prisma.userPreference.findUnique({ where: { userId } });

    const swipedIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });
    const excludedIds = new Set(swipedIds.map((s) => s.swipedId));

    const blockedByMe = await prisma.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    blockedByMe.forEach((b) => excludedIds.add(b.blockedId));

    const blockedMe = await prisma.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    });
    blockedMe.forEach((b) => excludedIds.add(b.blockerId));

    excludedIds.add(userId);

    const where: Record<string, unknown> = {
      userId: { notIn: Array.from(excludedIds) },
    };

    if (preferences?.genderPreference?.length) {
      where.gender = { in: preferences.genderPreference };
    }
    if (preferences?.intentPreference?.length) {
      where.intent = { in: preferences.intentPreference };
    }

    const candidates = await prisma.profile.findMany({
      where,
      include: {
        photos: { where: { moderationStatus: "approved" }, orderBy: { order: "asc" }, take: 3 },
      },
    });

    const scored = candidates
      .map((candidate) =>
        scoreProfile(candidate, userProfile, {
          ageMin: preferences?.ageMin ?? 18,
          ageMax: preferences?.ageMax ?? 60,
          distanceMax: preferences?.distanceMax ?? 50,
          intentPreference: preferences?.intentPreference ?? [],
          genderPreference: preferences?.genderPreference ?? [],
        })
      )
      .filter((s) => {
        const profileAge = calculateAge(candidateAge(s.profile));
        if (profileAge != null) {
          if (profileAge < (preferences?.ageMin ?? 18)) return false;
          if (profileAge > (preferences?.ageMax ?? 60)) return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);

    const deck = scored.slice(0, limit);

    const intentGroups: Record<string, number> = {};
    for (const item of deck) {
      const intent = (item.profile as Record<string, unknown>).intent as string || "unknown";
      intentGroups[intent] = (intentGroups[intent] ?? 0) + 1;
    }

    const remaining = await prisma.profile.count({
      where: { userId: { notIn: Array.from(excludedIds) } },
    });

    res.json({
      success: true,
      data: {
        deck,
        remaining,
        refreshAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        diversity: intentGroups,
      },
    });
  } catch (error) {
    next(error);
  }
});

function candidateAge(profile: Record<string, unknown>): Date | null {
  return (profile as { birthday?: Date | null }).birthday ?? null;
}

router.post("/swipe", authenticate, validate(swipeSchema), async (req, res, next) => {
  try {
    const swiperId = req.user!.userId;
    const { swipedId, direction, context } = req.body;

    if (swiperId === swipedId) {
      res.status(400).json({ success: false, error: "Cannot swipe on yourself" });
      return;
    }

    const existing = await prisma.swipe.findUnique({
      where: { swiperId_swipedId: { swiperId, swipedId } },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "Already swiped on this user" });
      return;
    }

    const reverseSwipe = await prisma.swipe.findUnique({
      where: { swiperId_swipedId: { swiperId: swipedId, swipedId: swiperId } },
    });
    const isMutual = reverseSwipe?.direction === "like" || reverseSwipe?.direction === "superlike";

    const swipe = await prisma.swipe.create({
      data: { swiperId, swipedId, direction, context, isMutual },
    });

    if (isMutual && (direction === "like" || direction === "superlike")) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const match = await prisma.match.create({
        data: {
          user1Id: swiperId < swipedId ? swiperId : swipedId,
          user2Id: swiperId < swipedId ? swipedId : swiperId,
          status: "active",
          matchedAt: now,
          expiresAt,
        },
      });

      await prisma.swipe.updateMany({
        where: {
          OR: [
            { swiperId, swipedId },
            { swiperId: swipedId, swipedId: swiperId },
          ],
        },
        data: { isMutual: true },
      });

      res.status(201).json({
        success: true,
        data: { swipe, isMatch: true, match },
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: { swipe, isMatch: false },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/prompts", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const swipedIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });
    const excludedIds = new Set(swipedIds.map((s) => s.swipedId));
    excludedIds.add(userId);

    const prompts = await prisma.prompt.findMany({
      where: {
        userId: { notIn: Array.from(excludedIds) },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        profile: { select: { displayName: true, locationCity: true } },
      },
    });

    const anonymousPrompts = prompts.map((p) => ({
      id: p.id,
      promptText: p.promptText,
      responseText: p.responseText,
      category: p.category,
      user: {
        displayName: p.profile?.displayName ?? "Anonymous",
        locationCity: p.profile?.locationCity ?? null,
      },
    }));

    res.json({ success: true, data: { prompts: anonymousPrompts } });
  } catch (error) {
    next(error);
  }
});

router.post("/prompts/:id/comment", authenticate, validate(promptCommentSchema), async (req, res, next) => {
  try {
    const promptId = req.params.id;
    const { comment } = req.body;

    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) throw new NotFoundError("Prompt not found");

    res.status(201).json({
      success: true,
      data: {
        comment: {
          id: "placeholder-" + Date.now(),
          promptId,
          userId: req.user!.userId,
          content: comment,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/compatibility", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!userProfile) {
      res.json({ success: true, data: { compatibility: [] } });
      return;
    }

    const targetUserId = req.query.targetUserId as string | undefined;

    const where: Record<string, unknown> = {};
    if (targetUserId) {
      where.userId = targetUserId;
    } else {
      const matches = await prisma.match.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          status: "active",
        },
      });
      const matchUserIds = matches.map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id));
      where.userId = { in: matchUserIds };
    }

    const profiles = await prisma.profile.findMany({
      where,
      include: { photos: { where: { isPrimary: true }, take: 1 } },
    });

    const compatibility = profiles.map((p) => {
      const valuesOverlap = userProfile.valuesTags.filter((v) => p.valuesTags.includes(v)).length;
      const maxValues = Math.max(userProfile.valuesTags.length, p.valuesTags.length) || 1;
      const valuesScore = valuesOverlap / maxValues;

      const interestsOverlap = userProfile.interests.filter((i) => p.interests.includes(i)).length;
      const maxInterests = Math.max(userProfile.interests.length, p.interests.length) || 1;
      const interestsScore = interestsOverlap / maxInterests;

      const intentScore = userProfile.intent && userProfile.intent === p.intent ? 1 : 0;

      const distance = calculateDistance(
        userProfile.locationLat,
        userProfile.locationLng,
        p.locationLat,
        p.locationLng
      );

      const overall = Math.round((valuesScore * 0.35 + interestsScore * 0.35 + intentScore * 0.3) * 100);

      return {
        userId: p.userId,
        displayName: p.displayName,
        overall,
        dimensions: {
          valuesMatch: Math.round(valuesScore * 100),
          interestsMatch: Math.round(interestsScore * 100),
          intentMatch: Math.round(intentScore * 100),
        },
        distanceKm: distance ? Math.round(distance) : null,
      };
    });

    compatibility.sort((a, b) => b.overall - a.overall);

    res.json({ success: true, data: { compatibility } });
  } catch (error) {
    next(error);
  }
});

router.get("/daily-picks", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const swipedIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });
    const excludedIds = new Set(swipedIds.map((s) => s.swipedId));
    excludedIds.add(userId);

    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!userProfile) {
      res.status(400).json({ success: false, error: "Complete your profile first" });
      return;
    }

    const preferences = await prisma.userPreference.findUnique({ where: { userId } });

    const candidates = await prisma.profile.findMany({
      where: {
        userId: { notIn: Array.from(excludedIds) },
        ...(preferences?.genderPreference?.length ? { gender: { in: preferences.genderPreference } } : {}),
      },
      include: {
        photos: { where: { moderationStatus: "approved" }, orderBy: { order: "asc" }, take: 3 },
      },
    });

    const scored = candidates
      .map((c) =>
        scoreProfile(c, userProfile, {
          ageMin: preferences?.ageMin ?? 18,
          ageMax: preferences?.ageMax ?? 60,
          distanceMax: preferences?.distanceMax ?? 50,
          intentPreference: preferences?.intentPreference ?? [],
          genderPreference: preferences?.genderPreference ?? [],
        })
      )
      .sort((a, b) => b.score - a.score);

    const picks = scored.slice(0, 10);

    res.json({
      success: true,
      data: {
        picks,
        date: new Date().toISOString().split("T")[0],
        remaining: candidates.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
