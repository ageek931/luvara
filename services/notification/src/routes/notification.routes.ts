import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const pushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/unread/count", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/read", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { id: req.params.id, userId },
      data: { readAt: new Date() },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

router.post("/read-all", authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

router.post("/push-token", authenticate, validate(pushTokenSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { token, platform } = req.body;

    await prisma.pushToken.upsert({
      where: { userId_token: { userId, token } },
      create: { userId, token, platform },
      update: { platform },
    });

    res.json({ success: true, data: { message: "Push token registered" } });
  } catch (error) {
    next(error);
  }
});

router.delete("/push-token/:token", authenticate, async (req, res, next) => {
  try {
    await prisma.pushToken.deleteMany({
      where: { userId: req.user!.userId, token: req.params.token },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
