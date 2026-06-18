export interface User {
  id: string;
  email: string;
  displayName: string;
  age: number;
  gender: string;
  orientation: string;
  bio: string;
  intent: string;
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  } | null;
  trustScore: number;
  verificationStatus: 'unverified' | 'pending' | 'photo_verified' | 'id_verified' | 'fully_verified';
  level: number;
  xpTotal: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  order: number;
  isPrimary: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

export interface Prompt {
  id: string;
  promptText: string;
  responseText: string;
  category: string;
}

export interface Preferences {
  ageMin: number;
  ageMax: number;
  distanceMax: number;
  genderPreference: string[];
  intentPreference: string[];
  dealbreakers: string[];
}

export interface Profile {
  userId: string;
  photos: Photo[];
  prompts: Prompt[];
  voiceIntro: string | null;
  videoIntro: string | null;
  preferences: Preferences;
  completenessScore: number;
}

export interface Swipe {
  id: string;
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'pass' | 'super_interest';
  context: string | null;
  createdAt: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'active' | 'expired' | 'unmatched' | 'archived';
  matchedAt: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentType: 'text' | 'voice' | 'image' | 'date_proposal' | 'reaction';
  createdAt: string;
  readAt: string | null;
}

export interface Conversation {
  id: string;
  matchId: string;
  participants: string[];
  lastMessageAt: string;
  messageCount: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodEnd: string;
  trialEnd: string | null;
}

export interface Plan {
  id: string;
  name: 'core' | 'premium' | 'elite';
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  priceCents: number;
  features: string[];
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: string;
  balanceAfter: number;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  source: string;
  balanceAfter: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  criteria: Record<string, unknown>;
}

export interface Streak {
  id: string;
  userId: string;
  type: 'daily' | 'conversation' | 'match';
  currentCount: number;
  longestCount: number;
  expiresAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  requirements: Record<string, unknown>;
  refreshType: 'daily' | 'weekly' | 'seasonal';
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  category: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt: string | null;
}

export interface TrustScoreBreakdown {
  photoVerified: boolean;
  idVerified: boolean;
  livenessVerified: boolean;
  profileCompleteness: number;
  accountAge: number;
  positiveBehavior: number;
  communityContribution: number;
  engagementConsistency: number;
  total: number;
}
