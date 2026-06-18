import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./config";
import conversationRoutes from "./routes/conversation.routes";
import { AppError } from "./utils/errors";
import type { Request, Response, NextFunction } from "express";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const decoded = jwt.verify(token as string, config.JWT_SECRET) as { userId: string; email: string };
    (socket as any).user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as any).user;
  if (!user) {
    socket.disconnect();
    return;
  }

  socket.join(`user:${user.userId}`);
  console.log(`User ${user.userId} connected via WebSocket`);

  socket.on("typing:start", (data: { conversationId: string }) => {
    socket.to(`user:${user.userId}`).emit("typing:start", {
      conversationId: data.conversationId,
      userId: user.userId,
    });
  });

  socket.on("typing:stop", (data: { conversationId: string }) => {
    socket.to(`user:${user.userId}`).emit("typing:stop", {
      conversationId: data.conversationId,
      userId: user.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${user.userId} disconnected`);
  });
});

app.set("io", io);

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: "ok", service: "chat", timestamp: new Date().toISOString() } });
});

app.use("/api/conversations", conversationRoutes);

app.all("*", (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: config.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

server.listen(config.PORT, () => {
  console.log(`Chat service listening on port ${config.PORT}`);
});

export { app, server, io };
