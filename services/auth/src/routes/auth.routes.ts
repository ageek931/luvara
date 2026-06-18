import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import rateLimit from "express-rate-limit";

import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/token.service";
import {
  createUser,
  findByEmail,
  findById,
  softDelete,
  updateLastActive,
  updatePassword,
} from "../services/user.service";
import { prisma } from "../utils/prisma";
import { UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors";
import { config } from "../config";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts. Please try again later." },
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const socialSchema = z.object({
  provider: z.enum(["google", "apple", "facebook"]),
  providerId: z.string().min(1, "Provider ID is required"),
  email: z.string().email("Invalid email address"),
  displayName: z.string().min(1, "Display name is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function sanitizeUser(user: { id: string; email: string; displayName: string; referralCode: string; isActive: boolean; createdAt: Date; authProvider: string; phone?: string | null; gender?: string | null; birthday?: Date | null; locationCity?: string | null; locationCountry?: string | null; bio?: string | null; intent?: string | null; valuesTags: string[]; interests: string[]; height?: number | null; education?: string | null; occupation?: string | null; locationLat?: number | null; locationLng?: number | null; trustScore: number; trustTier: string; isVerifiedPhoto: boolean; isVerifiedId: boolean; isVerifiedLiveness: boolean; completenessScore: number; level: number; xpTotal: number; lastActiveAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    gender: user.gender,
    birthday: user.birthday,
    locationCity: user.locationCity,
    locationCountry: user.locationCountry,
    bio: user.bio,
    intent: user.intent,
    valuesTags: user.valuesTags,
    interests: user.interests,
    height: user.height,
    education: user.education,
    occupation: user.occupation,
    locationLat: user.locationLat,
    locationLng: user.locationLng,
    trustScore: user.trustScore,
    trustTier: user.trustTier,
    isVerifiedPhoto: user.isVerifiedPhoto,
    isVerifiedId: user.isVerifiedId,
    isVerifiedLiveness: user.isVerifiedLiveness,
    completenessScore: user.completenessScore,
    level: user.level,
    xpTotal: user.xpTotal,
    referralCode: user.referralCode,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt,
  };
}

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    const user = await createUser({ email, password, displayName, authProvider: "email" });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user as any),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await updateLastActive(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/social", validate(socialSchema), async (req, res, next) => {
  try {
    const { provider, providerId, email, displayName } = req.body;

    let user = await findByEmail(email);

    if (user) {
      if (user.authProvider !== provider) {
        throw new ConflictError(
          `This email is registered with ${user.authProvider}. Please sign in with ${user.authProvider}.`
        );
      }
    } else {
      user = await createUser({
        email,
        displayName,
        authProvider: provider as any,
        authProviderId: providerId,
      });
    }

    await updateLastActive(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await rotateRefreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", validate(logoutSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await revokeRefreshToken(refreshToken);

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await findByEmail(email);
    if (!user) {
      res.json({
        success: true,
        data: { message: "If that email is registered, a reset link has been sent." },
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // TODO: Send email with reset link containing the token
    // await sendResetPasswordEmail(user.email, resetToken);

    res.json({
      success: true,
      data: {
        message: "If that email is registered, a reset link has been sent.",
        resetToken, // Exposed for MVP; remove in production
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

    let matchedToken: { userId: string; id: string } | null = null;
    for (const rt of resetTokens) {
      const isValid = await bcrypt.compare(token, rt.tokenHash);
      if (isValid) {
        matchedToken = { userId: rt.userId, id: rt.id };
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    await updatePassword(matchedToken.userId, password);

    await prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: matchedToken.userId } });

    res.json({ success: true, data: { message: "Password has been reset successfully." } });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await findById(req.user!.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/me", authenticate, async (req, res, next) => {
  try {
    await softDelete(req.user!.userId);
    await prisma.refreshToken.deleteMany({ where: { userId: req.user!.userId } });

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
