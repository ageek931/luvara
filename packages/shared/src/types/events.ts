import type {
  User,
  Swipe,
  Match,
  Message,
  Profile,
  Report,
} from './index.js';

export type UserEvent =
  | { event: 'user.registered'; payload: { user: User } }
  | { event: 'user.logged_in'; payload: { userId: string; timestamp: string } }
  | { event: 'user.deleted'; payload: { userId: string } };

export type SwipeEvent =
  | { event: 'swipe.created'; payload: { swipe: Swipe } };

export type MatchEvent =
  | { event: 'match.created'; payload: { match: Match } }
  | { event: 'match.expired'; payload: { matchId: string } }
  | { event: 'match.unmatched'; payload: { matchId: string; triggeredBy: string } };

export type MessageEvent =
  | { event: 'message.sent'; payload: { message: Message } }
  | { event: 'message.moderated'; payload: { messageId: string; flagged: boolean; reason?: string } };

export type ProfileEvent =
  | { event: 'profile.updated'; payload: { profile: Profile } }
  | { event: 'profile.completed'; payload: { userId: string; completenessScore: number } }
  | { event: 'profile.photo_verified'; payload: { userId: string; photoId: string } };

export type PaymentEvent =
  | { event: 'payment.succeeded'; payload: { userId: string; planId: string; transactionId: string } }
  | { event: 'payment.failed'; payload: { userId: string; planId: string; error: string } };

export type ReportEvent =
  | { event: 'report.created'; payload: { report: Report } }
  | { event: 'report.resolved'; payload: { reportId: string; resolution: string } };

export type LuvaraEvent =
  | UserEvent
  | SwipeEvent
  | MatchEvent
  | MessageEvent
  | ProfileEvent
  | PaymentEvent
  | ReportEvent;
