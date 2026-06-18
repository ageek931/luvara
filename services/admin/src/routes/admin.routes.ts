import { Router } from "express";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAdmin);

router.get("/dashboard", async (_req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const [
      totalUsers,
      activeUsersToday,
      totalMatches,
      totalMessages,
      pendingReports,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, isActive: true } }),
      prisma.match.count(),
      prisma.message.count(),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.subscription.count({ where: { status: "active" } }),
    ]);

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsersToday,
        totalMatches,
        totalMessages,
        pendingReports,
        activeSubscriptions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          displayName: true,
          isActive: true,
          isBanned: true,
          level: true,
          trustScore: true,
          createdAt: true,
          lastActiveAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            matchesAsUser1: true,
            matchesAsUser2: true,
            reportsFiled: true,
            reportsAgainst: true,
            moderationActions: true,
          },
        },
      },
    });

    await prisma.$disconnect();

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/ban", async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: true, isActive: false },
    });

    await prisma.$disconnect();

    res.json({ success: true, data: { message: "User banned" } });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/unban", async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false, isActive: true },
    });

    await prisma.$disconnect();

    res.json({ success: true, data: { message: "User unbanned" } });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/overview", async (_req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [registrations, matchesCreated, messagesSent, revenue] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.match.count({ where: { matchedAt: { gte: thirtyDaysAgo } } }),
      prisma.message.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.payment.aggregate({
        _sum: { amountCents: true },
        where: { createdAt: { gte: thirtyDaysAgo }, status: "succeeded" },
      }),
    ]);

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        registrations30d: registrations,
        matches30d: matchesCreated,
        messages30d: messagesSent,
        revenue30dCents: revenue._sum.amountCents ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
