import type { Match, TrustScoreBreakdown, User } from '../types/index.js';
import { TRUST_SCORE_WEIGHTS, LEVEL_THRESHOLDS } from '../constants/index.js';

export function calculateTrustScore(breakdown: TrustScoreBreakdown): number {
  const weighted =
    (breakdown.photoVerified ? TRUST_SCORE_WEIGHTS.photoVerified : 0) +
    (breakdown.idVerified ? TRUST_SCORE_WEIGHTS.idVerified : 0) +
    (breakdown.livenessVerified ? TRUST_SCORE_WEIGHTS.livenessVerified : 0) +
    (breakdown.profileCompleteness / 100) * TRUST_SCORE_WEIGHTS.profileCompleteness +
    Math.min(breakdown.accountAge / 365, 1) * TRUST_SCORE_WEIGHTS.accountAge +
    breakdown.positiveBehavior * TRUST_SCORE_WEIGHTS.positiveBehavior +
    breakdown.communityContribution * TRUST_SCORE_WEIGHTS.communityContribution +
    breakdown.engagementConsistency * TRUST_SCORE_WEIGHTS.engagementConsistency;

  return Math.round(clamp(weighted, 0, 1) * 1000) / 10;
}

export function calculateLevel(
  xpTotal: number,
): { level: number; xpForNext: number; progress: number } {
  let level = 1;
  let xpForNext = 0;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i]!;
    if (xpTotal >= threshold.xpRequired) {
      level = threshold.level;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1]!;
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];

  if (level >= 50) {
    return { level: 50, xpForNext: 0, progress: 1 };
  }

  xpForNext = nextThreshold.xpRequired - currentThreshold.xpRequired;
  const xpInLevel = xpTotal - currentThreshold.xpRequired;
  const progress = clamp(xpInLevel / xpForNext, 0, 1);

  return { level, xpForNext, progress };
}

export function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function calculateCompatibility(user1: User, user2: User): number {
  let score = 0;
  let factors = 0;

  if (user1.intent === user2.intent) {
    score += 30;
  } else {
    const compatibleIntents = new Set([
      'long_term_relationship',
      'marriage_minded',
    ]);
    if (
      compatibleIntents.has(user1.intent) &&
      compatibleIntents.has(user2.intent)
    ) {
      score += 20;
    }
  }
  factors += 30;

  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 2) {
    score += 25;
  } else if (ageDiff <= 5) {
    score += 15;
  } else if (ageDiff <= 10) {
    score += 5;
  }
  factors += 25;

  if (user1.orientation === user2.orientation) {
    score += 15;
  }
  factors += 15;

  const trustGap = Math.abs(user1.trustScore - user2.trustScore);
  if (trustGap <= 15) {
    score += 15;
  } else if (trustGap <= 30) {
    score += 8;
  }
  factors += 15;

  const levelGap = Math.abs(user1.level - user2.level);
  if (levelGap <= 3) {
    score += 15;
  } else if (levelGap <= 8) {
    score += 7;
  }
  factors += 15;

  return factors > 0 ? Math.round((score / factors) * 100) : 0;
}

export function isMatchExpired(match: Match): boolean {
  return new Date(match.expiresAt) <= new Date();
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local[0]! : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return code;
}

export function validateAge(birthday: string): boolean {
  const age = calculateAge(birthday);
  return age >= 18 && age <= 120;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
