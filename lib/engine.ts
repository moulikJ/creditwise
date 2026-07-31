import { CreditCard, SpendCategory, RewardRule } from "./types";

export type SpendProfile = Partial<Record<SpendCategory, number>>;

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function ruleFor(card: CreditCard, cat: SpendCategory): RewardRule | undefined {
  return card.rewardRules.find((r) => r.category === cat);
}

/** Effective reward rate a card earns in a category (falls back to base). */
export function effectiveRate(card: CreditCard, cat: SpendCategory): number {
  return ruleFor(card, cat)?.rate ?? card.baseRate;
}

/** Monthly reward value for one category, applying any monthly value cap. */
function monthlyCategoryValue(card: CreditCard, cat: SpendCategory, monthlySpend: number): number {
  if (monthlySpend <= 0) return 0;
  const rule = ruleFor(card, cat);
  const rate = rule?.rate ?? card.baseRate;
  let value = monthlySpend * rate;
  if (rule?.monthlyCapValue != null) value = Math.min(value, rule.monthlyCapValue);
  return value;
}

export function totalMonthlySpend(profile: SpendProfile): number {
  return Object.values(profile).reduce((s, v) => s + (v || 0), 0);
}

/** Gross annual reward value for a card against a spend profile. */
export function annualRewardValue(card: CreditCard, profile: SpendProfile): number {
  let monthly = 0;
  for (const [cat, spend] of Object.entries(profile) as [SpendCategory, number][]) {
    monthly += monthlyCategoryValue(card, cat, spend || 0);
  }
  return Math.round(monthly * 12);
}

/** Whether the annual fee applies, given spend (waiver thresholds). */
export function feeApplies(card: CreditCard, profile: SpendProfile): boolean {
  if (card.annualFee <= 0) return false;
  if (card.annualFeeWaiver <= 0) return true; // no waiver path
  const annualSpend = totalMonthlySpend(profile) * 12;
  return annualSpend < card.annualFeeWaiver;
}

export interface CardValuation {
  gross: number;
  fee: number;
  perksValue: number;
  net: number;
}

/** Net annual value = gross rewards + usable perk value − applicable fee. */
export function valuateCard(
  card: CreditCard,
  profile: SpendProfile,
  opts: { loungeVisitsUsed?: number; loungeValuePerVisit?: number } = {}
): CardValuation {
  const gross = annualRewardValue(card, profile);
  const fee = feeApplies(card, profile) ? card.annualFee : 0;
  const loungeUsed = Math.min(opts.loungeVisitsUsed ?? 0, card.loungeVisitsDomestic);
  const perksValue = loungeUsed * (opts.loungeValuePerVisit ?? 0);
  return { gross, fee, perksValue, net: gross + perksValue - fee };
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export function checkEligibility(
  card: CreditCard,
  applicant: { incomeAnnual?: number; creditScore?: number; age?: number }
): EligibilityResult {
  const reasons: string[] = [];
  if (applicant.incomeAnnual != null && applicant.incomeAnnual < card.minIncomeAnnual)
    reasons.push(`Income below ${inr(card.minIncomeAnnual)}/yr requirement`);
  if (applicant.creditScore != null && applicant.creditScore < card.minCreditScore)
    reasons.push(`Credit score below ${card.minCreditScore}`);
  if (applicant.age != null && applicant.age < card.minAge)
    reasons.push(`Minimum age is ${card.minAge}`);
  return { eligible: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

export interface RecommendationInput {
  profile: SpendProfile;
  incomeAnnual?: number;
  creditScore?: number;
  age?: number;
  preferNoFee?: boolean;
  wantLounge?: boolean;
  wantLowForex?: boolean;
  ownedCardIds?: string[];
}

export interface ScoredCard {
  card: CreditCard;
  net: number;
  gross: number;
  fee: number;
  score: number; // 0-100 fit score
  reasons: string[];
  topCategory?: { category: SpendCategory; rate: number };
}

const CAT_LABEL: Record<SpendCategory, string> = {
  online: "online shopping", dining: "dining", groceries: "groceries", fuel: "fuel",
  travel: "travel", bills: "bills", entertainment: "entertainment", upi: "UPI",
  international: "international spends", other: "general spends",
};

/**
 * Rank cards by fit. Score blends net annual value (primary) with how well the
 * card's strengths align to the user's largest spend categories and stated
 * preferences. Returns a sorted list with human-readable reasons.
 */
export function recommend(cards: CreditCard[], input: RecommendationInput): ScoredCard[] {
  const { profile, preferNoFee, wantLounge, wantLowForex } = input;
  const owned = new Set(input.ownedCardIds ?? []);

  // Eligible, not-owned candidates.
  const candidates = cards.filter((c) => {
    if (owned.has(c.id)) return false;
    const elig = checkEligibility(c, {
      incomeAnnual: input.incomeAnnual,
      creditScore: input.creditScore,
      age: input.age,
    });
    return elig.eligible;
  });

  // Largest spend categories drive the "alignment" reasons.
  const sortedCats = (Object.entries(profile) as [SpendCategory, number][])
    .filter(([, v]) => (v || 0) > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const topCats = sortedCats.slice(0, 3).map(([c]) => c);

  // Normalisation baseline: best net among candidates.
  const valuations = candidates.map((c) => ({ c, v: valuateCard(c, profile) }));
  const maxNet = Math.max(1, ...valuations.map((x) => x.v.net));

  const scored: ScoredCard[] = valuations.map(({ c, v }) => {
    const reasons: string[] = [];

    // 60% of score: net annual value vs the best candidate.
    let score = (v.net / maxNet) * 60;

    // 25%: alignment with the user's top categories.
    let alignment = 0;
    for (const cat of topCats) {
      const rate = effectiveRate(c, cat);
      if (rate > c.baseRate) {
        alignment += 1;
        reasons.push(`Earns ${(rate * 100).toFixed(1)}% on ${CAT_LABEL[cat]}, a top spend area`);
      }
    }
    score += (alignment / Math.max(1, topCats.length)) * 25;

    // 15%: preferences.
    if (preferNoFee && c.annualFee === 0) { score += 6; reasons.push("No annual fee, ever"); }
    if (wantLounge && c.loungeVisitsDomestic >= 4) { score += 5; reasons.push(`${c.loungeVisitsDomestic >= 99 ? "Unlimited" : c.loungeVisitsDomestic} domestic lounge visits/yr`); }
    if (wantLowForex && c.forexMarkup <= 2) { score += 4; reasons.push(`Low ${c.forexMarkup}% forex markup`); }

    if (v.fee === 0 && c.annualFee > 0) reasons.push(`Fee waived at your spend level`);
    if (reasons.length === 0) reasons.push(`Solid all-round value: ${inr(v.net)}/yr net`);

    const topCategory = topCats.length
      ? { category: topCats[0], rate: effectiveRate(c, topCats[0]) }
      : undefined;

    return { card: c, net: v.net, gross: v.gross, fee: v.fee, score: Math.round(Math.min(100, score)), reasons, topCategory };
  });

  return scored.sort((a, b) => b.score - a.score || b.net - a.net);
}

/** "Money left on the table": gap between optimal multi-card use of owned
 *  cards and using the single best owned card for everything. */
export function leftOnTable(ownedCards: CreditCard[], profile: SpendProfile): number {
  if (ownedCards.length === 0) return 0;
  // optimal: best card per category
  let optimalMonthly = 0;
  for (const [cat, spend] of Object.entries(profile) as [SpendCategory, number][]) {
    let best = 0;
    for (const c of ownedCards) best = Math.max(best, monthlyCategoryValue(c, cat, spend || 0));
    optimalMonthly += best;
  }
  const optimal = optimalMonthly * 12;
  // baseline: everything on the single best overall card
  const bestSingle = Math.max(...ownedCards.map((c) => annualRewardValue(c, profile)));
  return Math.max(0, Math.round(optimal - bestSingle));
}

/** Best owned card to swipe per category. */
export function swipePlaybook(ownedCards: CreditCard[], profile: SpendProfile) {
  const out: { category: SpendCategory; card?: CreditCard; rate: number }[] = [];
  for (const [cat, spend] of Object.entries(profile) as [SpendCategory, number][]) {
    if ((spend || 0) <= 0) continue;
    let best: CreditCard | undefined;
    let bestRate = -1;
    for (const c of ownedCards) {
      const r = effectiveRate(c, cat);
      if (r > bestRate) { bestRate = r; best = c; }
    }
    out.push({ category: cat, card: best, rate: bestRate < 0 ? 0 : bestRate });
  }
  return out;
}
