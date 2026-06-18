import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addXpSchema, spendCoinsSchema } from "../schemas/gamification.schema";
import { NotFoundError } from "../utils/errors";

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 4900, 5900, 7000, 8200, 9500, 10900, 12400, 14000, 15700,
  17500, 19400, 21400, 23500, 25700, 28000, 30400, 32900, 35500, 38200,
  41000, 43900, 46900, 50000, 53200, 56500, 59900, 63400, 67000, 70700,
  74500, 78400, 82400, 86500, 90700, 95000, 99400, 103900, 108500, 113200,
];

function getLevel(xpTotal: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xpTotal >= LEVEL_THRESHOLDS[i]!) return i + 1;
  }
  return 1;
}

function getXpForNextLevel(level: number): number {
  if (level >= 50) return 0;
  return LEVEL_THRESHOLDS[level]! - LEVEL_THRESHOLDS[level - 1]!;
}

function getProgressInLevel(xpTotal: number, level: number): number {
  if (level >= 50) return 1;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1]!;
  const nextThreshold = LEVEL_THRESHOLDS[level]!;
  const xpInLevel = xpTotal - currentThreshold;
  return Math.min(xpInLevel / (nextThreshold - currentThreshold), 1);
}

const router = Router();

router.get("/status", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const level = getLevel(user.xpTotal);

    const [badges, streaks, activeMissions] = await Promise.all([
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
      prisma.streak.findMany({ where: { userId } }),
      prisma.userMission.findMany({
        where: { userId, completed: false, mission: { isActive: true } },
        include: { mission: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        xpTotal: user.xpTotal,
        level,
        xpForNext: getXpForNextLevel(level),
        progress: getProgressInLevel(user.xpTotal, level),
        coinBalance: user.coinBalance,
        badges,
        streaks,
        activeMissions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/xp", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [entries, total] = await Promise.all([
      prisma.xpLedger.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.xpLedger.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/coins", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [entries, total] = await Promise.all([
      prisma.coinLedger.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coinLedger.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/xp/add", authenticate, validate(addXpSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { amount, source } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const newXpTotal = user.xpTotal + amount;
    const newLevel = getLevel(newXpTotal);

    const xpEntry = await prisma.xpLedger.create({
      data: { userId, amount, source, balanceAfter: newXpTotal },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { xpTotal: newXpTotal, level: newLevel },
    });

    const coinsEarned = Math.floor(amount / 100) * 5;
    if (coinsEarned > 0) {
      const newCoinBalance = user.coinBalance + coinsEarned;
      await prisma.coinLedger.create({
        data: { userId, amount: coinsEarned, source: "xp_conversion", balanceAfter: newCoinBalance },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { coinBalance: newCoinBalance },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        xpEntry,
        xpTotal: newXpTotal,
        level: newLevel,
        xpForNext: getXpForNextLevel(newLevel),
        progress: getProgressInLevel(newXpTotal, newLevel),
        coinsEarned,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/coins/spend", authenticate, validate(spendCoinsSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { amount, source } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");
    if (user.coinBalance < amount) {
      res.status(400).json({ success: false, error: "Insufficient coins" });
      return;
    }

    const newBalance = user.coinBalance - amount;

    const coinEntry = await prisma.coinLedger.create({
      data: { userId, amount: -amount, source, balanceAfter: newBalance },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { coinBalance: newBalance },
    });

    res.status(201).json({ success: true, data: { coinEntry, coinBalance: newBalance } });
  } catch (error) {
    next(error);
  }
});

router.get("/badges", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const [earnedBadges, allBadges] = await Promise.all([
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      }),
      prisma.badge.findMany({ orderBy: { category: "asc", name: "asc" } }),
    ]);

    const earnedSet = new Set(earnedBadges.map((ub) => ub.badgeId));

    const badges = allBadges.map((badge) => ({
      ...badge,
      earned: earnedSet.has(badge.id),
      earnedAt: earnedBadges.find((ub) => ub.badgeId === badge.id)?.earnedAt ?? null,
    }));

    res.json({ success: true, data: { badges } });
  } catch (error) {
    next(error);
  }
});

router.get("/missions", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const missions = await prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const userMissions = await prisma.userMission.findMany({
      where: { userId },
    });

    const missionMap = new Map(userMissions.map((um) => [um.missionId, um]));

    const result = missions.map((mission) => {
      const progress = missionMap.get(mission.id);
      return {
        ...mission,
        progress: progress?.progress ?? 0,
        completed: progress?.completed ?? false,
        completedAt: progress?.completedAt ?? null,
      };
    });

    res.json({ success: true, data: { missions: result } });
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const leaders = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { xpTotal: "desc" },
      take: limit,
      select: { id: true, displayName: true, level: true, xpTotal: true },
    });

    res.json({ success: true, data: { leaders } });
  } catch (error) {
    next(error);
  }
});

router.post("/streak/daily", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.streak.findUnique({
      where: { userId_type: { userId, type: "daily" } },
    });

    if (existing) {
      const lastActivity = new Date(existing.lastActivity);
      lastActivity.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        res.json({ success: true, data: { streak: existing, message: "Already checked in today" } });
        return;
      }

      const newCount = diffDays === 1 ? existing.currentCount + 1 : 1;
      const expiresAt = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

      const updated = await prisma.streak.update({
        where: { id: existing.id },
        data: {
          currentCount: newCount,
          longestCount: Math.max(newCount, existing.longestCount),
          lastActivity: today,
          expiresAt,
        },
      });

      await prisma.xpLedger.create({
        data: { userId, amount: 10, source: "daily_checkin_streak", balanceAfter: (await prisma.user.findUnique({ where: { id: userId } }))!.xpTotal + 10 },
      });
      await prisma.user.update({ where: { id: userId }, data: { xpTotal: { increment: 10 } } });

      res.json({ success: true, data: { streak: updated, xpEarned: 10 } });
      return;
    }

    const expiresAt = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const streak = await prisma.streak.create({
      data: { userId, type: "daily", currentCount: 1, longestCount: 1, lastActivity: today, expiresAt },
    });

    await prisma.xpLedger.create({
      data: { userId, amount: 10, source: "daily_checkin_streak", balanceAfter: (await prisma.user.findUnique({ where: { id: userId } }))!.xpTotal + 10 },
    });
    await prisma.user.update({ where: { id: userId }, data: { xpTotal: { increment: 10 } } });

    res.status(201).json({ success: true, data: { streak, xpEarned: 10 } });
  } catch (error) {
    next(error);
  }
});

export default router;
