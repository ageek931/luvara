import type { User, Match, Profile } from './index.js';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface MatchResponse {
  match: Match;
  user: Profile;
}

export interface DeckResponse {
  profiles: Profile[];
  remainingCount: number;
  refreshInMs: number;
}
