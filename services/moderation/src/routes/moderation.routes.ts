import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReportSchema } from "../schemas/moderation.schema";
import { NotFoundError } from "../utils/errors";

const router = Router();

router.post("/reports", authenticate, validate(createReportSchema), async (req, res, next) => {
  try {
    const reporterId = req.user!.userId;
    const { reportedId, category, description } = req.body;

    if (reporterId === reportedId) {
      res.status(400).json({ success: false, error: "Cannot report yourself" });
      return;
    }

    const existing = await prisma.report.findFirst({
      where: { reporterId, reportedId, status: { in: ["pending", "investigating"] } },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "Already reported this user" });
      return;
    }

    const report = await prisma.report.create({
      data: { reporterId, reportedId, category, description },
    });

    res.status(201).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
});

router.get("/reports", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {
      OR: [{ reporterId: userId }, { reportedId: userId }],
    };
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/reports", authenticate, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
        include: {
          reporter: { select: { id: true, displayName: true } },
          reported: { select: { id: true, displayName: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/reports/:id/resolve", authenticate, async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const moderatorId = req.user!.userId;
    const { action, moderatorNote, durationDays } = req.body;

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundError("Report not found");

    const resolvedStatus = action === "dismiss" ? "dismissed" : "resolved";

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: resolvedStatus,
        moderatorId,
        moderatorNote,
        resolvedAt: new Date(),
      },
    });

    if (action !== "dismiss") {
      await prisma.moderationAction.create({
        data: {
          userId: report.reportedId,
          moderatorId,
          action: action as any,
          reason: moderatorNote,
          durationDays,
        },
      });

      if (action === "ban") {
        await prisma.user.update({
          where: { id: report.reportedId },
          data: { isBanned: true, isActive: false },
        });
      }
    }

    res.json({ success: true, data: { message: `Report ${resolvedStatus}` } });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/queue", authenticate, async (req, res, next) => {
  try {
    const urgentCount = await prisma.report.count({
      where: { status: "pending", category: { in: ["underage", "explicit_content"] } },
    });

    const standardCount = await prisma.report.count({
      where: { status: "pending", category: { notIn: ["underage", "explicit_content"] } },
    });

    const investigatingCount = await prisma.report.count({
      where: { status: "investigating" },
    });

    res.json({
      success: true,
      data: { urgentCount, standardCount, investigatingCount },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
