import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { config } from "../config";
import { UnauthorizedError } from "../utils/errors";

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(user: { id: string; email: string }): string {
  const payload: TokenPayload = { userId: user.id, email: user.email };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

export async function generateRefreshToken(user: { id: string }): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const hash = await bcrypt.hash(rawToken, 10);

  await prisma.refreshToken.create({
    data: {
      token: hash,
      userId: user.id,
      expiresAt,
    },
  });

  return rawToken;
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; tokenId: string }> {
  const tokens = await prisma.refreshToken.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  for (const stored of tokens) {
    const isValid = await bcrypt.compare(token, stored.token);
    if (isValid) {
      if (!stored.user.isActive) {
        throw new UnauthorizedError("Account is deactivated");
      }
      return { userId: stored.userId, tokenId: stored.id };
    }
  }

  throw new UnauthorizedError("Invalid or expired refresh token");
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { userId } = await verifyRefreshToken(oldToken);

  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  for (const stored of tokens) {
    const isMatch = await bcrypt.compare(oldToken, stored.token);
    if (isMatch) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      break;
    }
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return { accessToken, refreshToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  for (const stored of tokens) {
    const isMatch = await bcrypt.compare(token, stored.token);
    if (isMatch) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      return;
    }
  }
}
