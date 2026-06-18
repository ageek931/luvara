import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { sendMessageSchema, conversationQuerySchema, messageQuerySchema } from "../schemas/message.schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";

const router = Router();

router.get("/", authenticate, validate(conversationQuerySchema, "query"), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { page, limit } = req.query as z.infer<typeof conversationQuerySchema>;

    const matchIds = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: { not: "unmatched" },
      },
      select: { id: true },
    });

    const matchIdList = matchIds.map((m) => m.id);

    const where = { matchId: { in: matchIdList } };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { id: true, displayName: true } } },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/messages", authenticate, validate(messageQuerySchema, "query"), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    const match = await prisma.match.findUnique({ where: { id: conversation.matchId } });
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ForbiddenError("Not a participant in this conversation");
    }

    const { page, limit } = req.query as z.infer<typeof messageQuerySchema>;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { id: true, displayName: true } } },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    if (userId !== match.user1Id && userId !== match.user2Id) {
      throw new ForbiddenError("Not a participant in this conversation");
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, validate(sendMessageSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { conversationId, matchId, content, contentType } = req.body;

    let targetConversationId = conversationId;

    if (!targetConversationId && matchId) {
      let conversation = await prisma.conversation.findUnique({ where: { matchId } });

      if (!conversation) {
        const match = await prisma.match.findUnique({ where: { id: matchId } });
        if (!match) throw new NotFoundError("Match not found");
        if (match.user1Id !== userId && match.user2Id !== userId) {
          throw new ForbiddenError("Not a participant in this match");
        }
        if (match.status !== "active") {
          res.status(400).json({ success: false, error: "Match is not active" });
          return;
        }

        conversation = await prisma.conversation.create({
          data: { matchId },
        });

        if (!match.firstMessageAt) {
          await prisma.match.update({
            where: { id: matchId },
            data: { firstMessageAt: new Date() },
          });
        }
      }

      targetConversationId = conversation.id;
    }

    if (!targetConversationId) {
      res.status(400).json({ success: false, error: "conversationId or matchId required" });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: targetConversationId },
    });
    if (!conversation) throw new NotFoundError("Conversation not found");

    const match = await prisma.match.findUnique({ where: { id: conversation.matchId } });
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ForbiddenError("Not a participant in this conversation");
    }

    const message = await prisma.message.create({
      data: {
        conversationId: targetConversationId,
        senderId: userId,
        content,
        contentType,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    await prisma.conversation.update({
      where: { id: targetConversationId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    await prisma.match.update({
      where: { id: conversation.matchId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    const io = req.app.get("io");
    if (io) {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      io.to(`user:${otherUserId}`).emit("message:new", message);
      io.to(`user:${userId}`).emit("message:sent", message);
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/read", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundError("Conversation not found");

    const match = await prisma.match.findUnique({ where: { id: conversation.matchId } });
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ForbiddenError("Not a participant in this conversation");
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({ success: true, data: { message: "Messages marked as read" } });
  } catch (error) {
    next(error);
  }
});

router.get("/unread/count", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const unreadCount = await prisma.message.count({
      where: {
        senderId: { not: userId },
        readAt: null,
        conversation: {
          match: {
            OR: [{ user1Id: userId }, { user2Id: userId }],
            status: "active",
          },
        },
      },
    });

    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    next(error);
  }
});

export default router;
