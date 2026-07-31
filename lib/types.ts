// ============================================================================
// CreditWise domain model
// ============================================================================

export type SpendCategory =
  | "online"
  | "dining"
  | "groceries"
  | "fuel"
  | "travel"
  | "bills"
  | "entertainment"
  | "upi"
  | "international"
  | "other";

export type CardCategory =
  | "Cashback"
  | "Travel"
  | "Fuel"
  | "Shopping"
  | "Premium"
  | "Student"
  | "Rewards"
  | "Co-brand";

export interface RewardRule {
  /** category this rule applies to */
  category: SpendCategory;
  /** effective value returned per ₹1 spent (0.05 = 5%) */
  rate: number;
  /** optional monthly cap on the *value* earned at this boosted rate (₹) */
  monthlyCapValue?: number;
}

export interface CreditCard {
  id: string;
  slug: string;
  name: string;
  bank: string;
  network: ("Visa" | "Mastercard" | "RuPay" | "Diners" | "Amex")[];
  category: CardCategory;
  tier: "Entry" | "Mid" | "Premium" | "Super-premium";
  image?: string; // gradient key; rendered, not a binary
  color: string;

  // fees
  joiningFee: number;
  annualFee: number;
  annualFeeWaiver: number; // annual spend that waives the fee; 0 = no waiver / lifetime free

  // rewards
  baseRate: number; // fallback rate for unlisted categories
  rewardRules: RewardRule[];
  rewardCurrency: string; // "Cashback" | "Reward Points" | "NeuCoins" | "EDGE Miles" ...
  pointValue: number; // ₹ per point/unit when redeemed optimally

  // eligibility
  minIncomeAnnual: number;
  minCreditScore: number;
  minAge: number;

  // benefits
  loungeVisitsDomestic: number; // per year
  loungeVisitsIntl: number;
  forexMarkup: number; // %
  welcomeBonusValue: number; // ₹
  welcomeBonusDesc: string;
  benefits: string[];
  bestFor: string[];

  // editorial
  summary: string;
  pros: string[];
  cons: string[];

  // data provenance
  verified?: boolean;          // true = core fields confirmed against official/aggregator source
  verifiedOn?: string;         // ISO date of last verification
  officialUrl?: string;        // bank's official card page for "check latest"
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Favorite {
  userId: string;
  cardId: string;
  createdAt: string;
}

export interface RecommendationRecord {
  id: string;
  userId: string;
  spendProfile: Record<SpendCategory, number>;
  resultCardIds: string[];
  createdAt: string;
}

// analytics event
export interface AnalyticsEvent {
  id: string;
  type: "view" | "compare" | "search" | "recommend" | "calculate";
  cardId?: string;
  query?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export const SPEND_CATEGORIES: { key: SpendCategory; label: string; icon: string }[] = [
  { key: "online", label: "Online shopping", icon: "🛍️" },
  { key: "dining", label: "Dining & food delivery", icon: "🍽️" },
  { key: "groceries", label: "Groceries", icon: "🛒" },
  { key: "fuel", label: "Fuel", icon: "⛽" },
  { key: "travel", label: "Travel & flights", icon: "✈️" },
  { key: "bills", label: "Bills & utilities", icon: "🧾" },
  { key: "entertainment", label: "Entertainment", icon: "🎬" },
  { key: "upi", label: "UPI / everyday", icon: "📲" },
  { key: "international", label: "International", icon: "🌍" },
  { key: "other", label: "Everything else", icon: "💳" },
];

export const CARD_CATEGORIES: CardCategory[] = [
  "Cashback", "Travel", "Fuel", "Shopping", "Premium", "Student", "Rewards", "Co-brand",
];
