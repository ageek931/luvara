import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { extendMatchSchema, unmatchSchema, matchQuerySchema } from "../schemas/match.schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";

const router = Router();

router.get("/", authenticate, validate(matchQuerySchema, "query"), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { status, page, limit } = req.query as z.infer<typeof matchQuerySchema>;

    const where: Record<string, unknown> = {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    };
    if (status) where.status = status;

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { matchedAt: "desc" },
        include: {
          user1: { select: { id: true, displayName: true } },
          user2: { select: { id: true, displayName: true } },
        },
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        matches,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: {
        user1: { select: { id: true, displayName: true } },
        user2: { select: { id: true, displayName: true } },
      },
    });

    if (!match) throw new NotFoundError("Match not found");

    if (match.user1Id !== req.user!.userId && match.user2Id !== req.user!.userId) {
      throw new ForbiddenError("Not a participant in this match");
    }

    res.json({ success: true, data: { match } });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/extend", authenticate, validate(extendMatchSchema), async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({ where: { id: req.params.id } });
    if (!match) throw new NotFoundError("Match not found");

    if (match.user1Id !== req.user!.userId && match.user2Id !== req.user!.userId) {
      throw new ForbiddenError("Not a participant in this match");
    }
    if (match.status !== "active") {
      res.status(400).json({ success: false, error: "Match is not active" });
      return;
    }

    const { hours } = req.body;
    const newExpiresAt = new Date(match.expiresAt.getTime() + hours * 60 * 60 * 1000);

    const updated = await prisma.match.update({
      where: { id: match.id },
      data: { expiresAt: newExpiresAt },
    });

    res.json({ success: true, data: { match: updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/unmatch", authenticate, validate(unmatchSchema), async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({ where: { id: req.params.id } });
    if (!match) throw new NotFoundError("Match not found");

    if (match.user1Id !== req.user!.userId && match.user2Id !== req.user!.userId) {
      throw new ForbiddenError("Not a participant in this match");
    }

    const updated = await prisma.match.update({
      where: { id: match.id },
      data: { status: "unmatched" },
    });

    res.json({ success: true, data: { match: updated } });
  } catch (error) {
    next(error);
  }
});

router.get("/mutual/likes", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const likesReceived = await prisma.swipe.findMany({
      where: {
        swipedId: userId,
        direction: { in: ["like", "superlike"] },
        isMutual: false,
      },
      include: {
        swiper: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: { likes: likesReceived } });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const [activeMatches, totalMatches, expiredCount, unmatchedCount] = await Promise.all([
      prisma.match.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: "active" },
      }),
      prisma.match.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      }),
      prisma.match.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: "expired" },
      }),
      prisma.match.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: "unmatched" },
      }),
    ]);

    res.json({
      success: true,
      data: { activeMatches, totalMatches, expiredCount, unmatchedCount },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
