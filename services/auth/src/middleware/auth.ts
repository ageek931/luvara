import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import { UnauthorizedError } from "../utils/errors";
import { findById } from "../services/user.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const payload = verifyAccessToken(token);

    const user = await findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or deactivated");
    }

    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (error) {
    next(error);
  }
}
