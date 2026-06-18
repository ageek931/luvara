export const INTENTS = [
  'long_term_relationship',
  'casual_dating',
  'new_friends',
  'still_figuring_out',
  'marriage_minded',
  'short_term_fun',
] as const;

export type Intent = (typeof INTENTS)[number];

export const GENDERS = [
  'man',
  'woman',
  'non_binary',
  'agender',
  'genderfluid',
  'two_spirit',
  'custom',
] as const;

export type Gender = (typeof GENDERS)[number];

export const ORIENTATIONS = [
  'straight',
  'gay',
  'lesbian',
  'bisexual',
  'pansexual',
  'asexual',
  'demisexual',
  'queer',
  'questioning',
] as const;

export type Orientation = (typeof ORIENTATIONS)[number];

export const XP_SOURCES: Record<string, number> = {
  profile_completed: 100,
  photo_uploaded: 25,
  photo_verified: 150,
  id_verified: 300,
  daily_checkin: 10,
  streak_bonus: 50,
  swipe_session: 5,
  match_made: 100,
  message_sent: 2,
  conversation_milestone_10: 50,
  conversation_milestone_50: 100,
  conversation_milestone_100: 250,
  date_proposed: 75,
  date_completed: 200,
  report_helpful: 50,
  community_report: 30,
  mission_completed: 0,
  referral_signup: 200,
  badge_earned: 0,
} as const;

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  unlocks: string[];
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0, unlocks: ['basic_profile', 'swipe'] },
  { level: 2, xpRequired: 100, unlocks: ['upload_photos'] },
  { level: 3, xpRequired: 250, unlocks: ['add_prompts'] },
  { level: 4, xpRequired: 450, unlocks: ['daily_super_like'] },
  { level: 5, xpRequired: 700, unlocks: ['rewind'] },
  { level: 6, xpRequired: 1000, unlocks: ['see_likes_you'] },
  { level: 7, xpRequired: 1400, unlocks: ['boost_highlight'] },
  { level: 8, xpRequired: 1900, unlocks: ['incognito_mode'] },
  { level: 9, xpRequired: 2500, unlocks: ['travel_mode'] },
  { level: 10, xpRequired: 3200, unlocks: ['profile_badge_level_10'] },
  { level: 11, xpRequired: 4000, unlocks: ['extended_bio'] },
  { level: 12, xpRequired: 4900, unlocks: ['priority_support'] },
  { level: 13, xpRequired: 5900, unlocks: ['weekly_boost'] },
  { level: 14, xpRequired: 7000, unlocks: ['verified_badge_highlight'] },
  { level: 15, xpRequired: 8200, unlocks: ['profile_badge_level_15'] },
  { level: 16, xpRequired: 9500, unlocks: ['advanced_filters'] },
  { level: 17, xpRequired: 10900, unlocks: ['super_boost'] },
  { level: 18, xpRequired: 12400, unlocks: ['read_receipts'] },
  { level: 19, xpRequired: 14000, unlocks: ['who_liked_me'] },
  { level: 20, xpRequired: 15700, unlocks: ['profile_badge_level_20'] },
  { level: 21, xpRequired: 17500, unlocks: ['daily_super_likes_x3'] },
  { level: 22, xpRequired: 19400, unlocks: ['message_priority'] },
  { level: 23, xpRequired: 21400, unlocks: ['spotlight'] },
  { level: 24, xpRequired: 23500, unlocks: ['date_ideas_access'] },
  { level: 25, xpRequired: 25700, unlocks: ['profile_badge_level_25'] },
  { level: 26, xpRequired: 28000, unlocks: ['unlimited_rewinds'] },
  { level: 27, xpRequired: 30400, unlocks: ['exclusive_events'] },
  { level: 28, xpRequired: 32900, unlocks: ['concierge_service'] },
  { level: 29, xpRequired: 35500, unlocks: ['ai_match_insights'] },
  { level: 30, xpRequired: 38200, unlocks: ['profile_badge_level_30'] },
  { level: 31, xpRequired: 41000, unlocks: ['private_mode'] },
  { level: 32, xpRequired: 43900, unlocks: ['video_intro'] },
  { level: 33, xpRequired: 46900, unlocks: ['boost_x2'] },
  { level: 34, xpRequired: 50000, unlocks: ['guest_list'] },
  { level: 35, xpRequired: 53200, unlocks: ['profile_badge_level_35'] },
  { level: 36, xpRequired: 56500, unlocks: ['unlimited_boosts'] },
  { level: 37, xpRequired: 59900, unlocks: ['verified_mentor'] },
  { level: 38, xpRequired: 63400, unlocks: ['early_access'] },
  { level: 39, xpRequired: 67000, unlocks: ['beta_features'] },
  { level: 40, xpRequired: 70700, unlocks: ['profile_badge_level_40'] },
  { level: 41, xpRequired: 74500, unlocks: ['vip_support'] },
  { level: 42, xpRequired: 78400, unlocks: ['matchmaker_access'] },
  { level: 43, xpRequired: 82400, unlocks: ['community_spotlight'] },
  { level: 44, xpRequired: 86500, unlocks: ['charity_match'] },
  { level: 45, xpRequired: 90700, unlocks: ['profile_badge_level_45'] },
  { level: 46, xpRequired: 95000, unlocks: ['ambassador_program'] },
  { level: 47, xpRequired: 99400, unlocks: ['founders_circle'] },
  { level: 48, xpRequired: 103900, unlocks: ['all_unlocked'] },
  { level: 49, xpRequired: 108500, unlocks: ['all_unlocked'] },
  { level: 50, xpRequired: 113200, unlocks: ['all_unlocked', 'legendary_badge'] },
];

export const MATCH_WINDOW_HOURS = 48;
export const MAX_SWIPES_FREE = 200;
export const SWIPE_WINDOW_HOURS = 12;

export const BOOST_MULTIPLIERS: Record<string, number> = {
  normal: 1.0,
  highlight: 1.5,
  super_boost: 2.0,
  spotlight: 3.0,
} as const;

export const TRUST_SCORE_WEIGHTS: Record<string, number> = {
  photoVerified: 0.15,
  idVerified: 0.20,
  livenessVerified: 0.10,
  profileCompleteness: 0.15,
  accountAge: 0.10,
  positiveBehavior: 0.12,
  communityContribution: 0.08,
  engagementConsistency: 0.10,
} as const;

export const SAFETY_SLAS: Record<string, number> = {
  photoModeration_ms: 30_000,
  reportResponse_ms: 300_000,
  supportTicketResponse_ms: 600_000,
  criticalIssueResponse_ms: 300_000,
  messageFlagReview_ms: 60_000,
} as const;

export const SWIPE_LIMITS: Record<string, number> = {
  free: MAX_SWIPES_FREE,
  core: 500,
  premium: 1500,
  elite: 5000,
} as const;

export const COIN_COSTS: Record<string, number> = {
  superLike: 5,
  boost: 20,
  rewind: 3,
  readReceipt: 10,
  spotlight: 50,
  travelMode: 15,
} as const;

export const IMAGE_CONSTRAINTS = {
  maxFileSizeBytes: 10 * 1024 * 1024,
  minWidth: 400,
  minHeight: 400,
  maxWidth: 4096,
  maxHeight: 4096,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  maxPhotosPerProfile: 9,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
} as const;
