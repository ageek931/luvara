import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../utils/prisma";
import { ConflictError, NotFoundError } from "../utils/errors";
import type { AuthProvider, Prisma } from "@prisma/client";

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

interface CreateUserParams {
  email: string;
  password?: string;
  authProvider?: AuthProvider;
  authProviderId?: string;
  displayName: string;
  phone?: string;
  birthday?: Date;
  gender?: string;
  locationCity?: string;
  locationCountry?: string;
}

export async function createUser(params: CreateUserParams) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    throw new ConflictError("A user with this email already exists");
  }

  let passwordHash: string | undefined;
  if (params.password) {
    passwordHash = await bcrypt.hash(params.password, 12);
  }

  let referralCode = generateReferralCode();
  while (await prisma.user.findUnique({ where: { referralCode } })) {
    referralCode = generateReferralCode();
  }

  const user = await prisma.user.create({
    data: {
      email: params.email,
      phone: params.phone,
      passwordHash,
      authProvider: params.authProvider ?? "email",
      authProviderId: params.authProviderId,
      displayName: params.displayName,
      birthday: params.birthday,
      gender: params.gender,
      locationCity: params.locationCity,
      locationCountry: params.locationCountry,
      referralCode,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      authProvider: true,
      referralCode: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function findByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
}

export async function findById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function findByReferralCode(code: string) {
  const user = await prisma.user.findUnique({ where: { referralCode: code } });
  return user;
}

export async function softDelete(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function updateLastActive(id: string) {
  await prisma.user.update({
    where: { id },
    data: { lastActiveAt: new Date() },
  });
}

export async function updatePassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}
