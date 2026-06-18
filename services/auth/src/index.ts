import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import { AppError } from "./utils/errors";
import type { Request, Response, NextFunction } from "express";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: "ok", service: "auth", timestamp: new Date().toISOString() } });
});

app.use("/api/auth", authRoutes);

app.all("*", (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found`, 404));
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err instanceof ValidationError && err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: config.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

app.listen(config.PORT, () => {
  console.log(`Auth service listening on port ${config.PORT}`);
});

export default app;
