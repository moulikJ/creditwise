import { NextRequest, NextResponse } from "next/server";
import { cardRepo, analyticsRepo } from "@/lib/repo";
import { recommend } from "@/lib/engine";
import type { SpendCategory } from "@/lib/types";

// Lightweight, explainable NL → spend-profile parser. Maps keywords to
// categories and infers rough monthly amounts + preferences from the message.
const KEYWORDS: Record<SpendCategory, string[]> = {
  online: ["online", "amazon", "flipkart", "shopping", "myntra", "ecommerce"],
  dining: ["dining", "restaurant", "food", "swiggy", "zomato", "eat", "dine"],
  groceries: ["grocery", "groceries", "bigbasket", "supermarket", "blinkit"],
  fuel: ["fuel", "petrol", "diesel", "gas", "commute", "car"],
  travel: ["travel", "flight", "hotel", "trip", "vacation", "airline", "lounge"],
  bills: ["bill", "bills", "utility", "utilities", "electricity", "recharge", "mobile"],
  entertainment: ["movie", "movies", "netflix", "entertainment", "ott", "bookmyshow"],
  upi: ["upi", "gpay", "phonepe", "paytm", "scan"],
  international: ["international", "abroad", "forex", "overseas", "foreign"],
  other: [],
};

function parse(text: string) {
  const t = text.toLowerCase();
  const profile: Partial<Record<SpendCategory, number>> = {};
  const hits: SpendCategory[] = [];
  for (const [cat, words] of Object.entries(KEYWORDS) as [SpendCategory, string[]][]) {
    if (words.some((w) => t.includes(w))) hits.push(cat);
  }
  // amounts mentioned, e.g. "spend 20000 on travel" — assign to nearest hit or distribute
  const amounts = [...t.matchAll(/(?:₹|rs\.?\s?)?(\d{3,7})/g)].map((m) => Number(m[1])).filter((n) => n >= 500);
  const base = amounts.length ? Math.round(amounts.reduce((a, b) => a + b, 0) / Math.max(amounts.length, hits.length || 1)) : 8000;
  (hits.length ? hits : (["online", "dining", "groceries"] as SpendCategory[])).forEach((c, i) => {
    profile[c] = amounts[i] ?? base;
  });

  const preferNoFee = /no fee|free|lifetime free|without fee|cheap/.test(t);
  const wantLounge = /lounge|airport|travel|fly|flight/.test(t);
  const wantLowForex = /forex|international|abroad|overseas|foreign/.test(t);
  const incomeMatch = t.match(/(\d{1,3})\s?(lakh|lpa|l\b)/);
  const incomeAnnual = incomeMatch ? Number(incomeMatch[1]) * 100000 : undefined;

  return { profile, preferNoFee, wantLounge, wantLowForex, incomeAnnual, hits };
}

export async function POST(req: NextRequest) {
  let body: { message?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Empty message" }, { status: 422 });

  const intent = parse(message);
  const results = recommend(cardRepo.all(), intent as never).slice(0, 3);
  analyticsRepo.track({ type: "recommend", query: message.slice(0, 80), meta: { via: "advisor" } });

  const catList = intent.hits.length ? intent.hits.join(", ") : "general everyday";
  const reply =
    results.length === 0
      ? "I couldn't find an eligible match — try sharing your rough income and main spends."
      : `Based on your message I picked up spending on ${catList}` +
        (intent.preferNoFee ? ", a preference for no annual fee" : "") +
        (intent.wantLounge ? ", and interest in lounge/travel perks" : "") +
        `. Here are the cards that fit best:`;

  return NextResponse.json({ reply, intent, results });
}
